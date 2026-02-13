/**
 * api.revenue.ts 단위 테스트
 *
 * 테스트 범위:
 * - Authorization 헤더 검증
 * - Zod discriminatedUnion 검증 (REVENUE / MILESTONE / METRICS)
 * - 정상 데이터 처리 흐름
 * - 에러 핸들링
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/env", () => ({
    getEnv: (key: string) => {
        if (key === "CHOONSIM_API_KEY") return "test-api-key-secret";
        return undefined;
    },
}));

const mockInsertValues = vi.fn().mockResolvedValue(undefined);
const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
const mockUpdateSet = vi.fn(() => ({
    where: mockUpdateWhere,
}));
const mockFindFirst = vi.fn().mockResolvedValue({
    id: "choonsim-main",
    name: "Chunsim AI-Talk",
    totalSubscribers: 100,
    totalFollowers: 5000,
});

vi.mock("@/db", () => ({
    db: {
        query: {
            choonsimProjects: {
                findFirst: (...args: unknown[]) => mockFindFirst(...args),
            },
        },
        insert: () => ({
            values: mockInsertValues,
        }),
        update: () => ({
            set: mockUpdateSet,
        }),
    },
}));

vi.mock("@/db/schema", () => ({
    choonsimRevenue: {},
    choonsimProjects: { id: "id" },
    choonsimMilestones: {},
    choonsimMetricsHistory: {},
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
}));

// Fix for error: No "default" export is defined on the "node:crypto" mock
vi.mock("node:crypto", () => {
    const mockRandomUUID = vi.fn(() => "test-uuid-123");
    return {
        randomUUID: mockRandomUUID,
        default: {
            randomUUID: mockRandomUUID,
        },
    };
});

vi.mock("@/lib/relayer", () => ({
    relayDepositYield: vi.fn().mockResolvedValue("0xMockTxHash"),
}));

// ---------------------------------------------------------------------------
// Import module under test
// ---------------------------------------------------------------------------
import { action } from "@/routes/api.revenue";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
    body: unknown,
    apiKey = "test-api-key-secret",
    method = "POST",
): Request {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }
    return new Request("http://localhost:3000/api/revenue", {
        method,
        headers,
        body: JSON.stringify(body),
    });
}

async function parseResponse(response: Response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("api.revenue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockInsertValues.mockResolvedValue(undefined);
        mockUpdateWhere.mockResolvedValue(undefined);
        mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
        mockFindFirst.mockResolvedValue({
            id: "choonsim-main",
            name: "Chunsim AI-Talk",
            totalSubscribers: 100,
            totalFollowers: 5000,
        });
    });

    // --- Method validation ---
    it("GET 요청을 405로 거부해야 한다", async () => {
        const req = new Request("http://localhost:3000/api/revenue", {
            method: "GET",
            headers: { Authorization: "Bearer test-api-key-secret" },
        });
        const res = await action({ request: req, params: {}, context: {} } as any);
        expect(res.status).toBe(405);
    });

    // --- Auth validation ---
    it("Authorization 헤더 없이 401을 반환해야 한다", async () => {
        const req = new Request("http://localhost:3000/api/revenue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "REVENUE", data: { amount: "100", source: "test", description: "test" } }),
        });
        const res = await action({ request: req, params: {}, context: {} } as any);
        expect(res.status).toBe(401);
    });

    it("잘못된 API 키로 401을 반환해야 한다", async () => {
        const res = await action({
            request: makeRequest(
                { type: "REVENUE", data: { amount: "100", source: "test", description: "test" } },
                "wrong-key",
            ),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(401);
    });

    // --- Body validation ---
    it("잘못된 type을 400으로 거부해야 한다", async () => {
        const res = await action({
            request: makeRequest({ type: "INVALID", data: {} }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(400);
        const body = await parseResponse(res);
        expect(body.success).toBe(false);
    });

    it("REVENUE 타입에서 amount가 숫자 문자열이 아니면 400", async () => {
        const res = await action({
            request: makeRequest({ type: "REVENUE", data: { amount: "abc", source: "test", description: "test" } }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(400);
    });

    it("REVENUE 타입에서 amount가 최대치 초과 시 400", async () => {
        const res = await action({
            request: makeRequest({ type: "REVENUE", data: { amount: "2000000", source: "test", description: "test" } }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(400);
    });

    // --- Success flows ---
    it("유효한 REVENUE 요청을 성공적으로 처리해야 한다", async () => {
        const res = await action({
            request: makeRequest({
                type: "REVENUE",
                data: { amount: "150.50", source: "SUBSCRIPTION", description: "Monthly subscription" },
            }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(200);
        const body = await parseResponse(res);
        expect(body.success).toBe(true);
        expect(mockInsertValues).toHaveBeenCalled();
    });

    it("유효한 METRICS 요청을 성공적으로 처리해야 한다", async () => {
        const res = await action({
            request: makeRequest({
                type: "METRICS",
                data: { followers: 10000, subscribers: 500 },
            }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(200);
        const body = await parseResponse(res);
        expect(body.success).toBe(true);
        // Should update project and record metrics history
        expect(mockUpdateSet).toHaveBeenCalled();
        expect(mockInsertValues).toHaveBeenCalled();
    });

    it("유효한 MILESTONE 요청을 성공적으로 처리해야 한다", async () => {
        const res = await action({
            request: makeRequest({
                type: "MILESTONE",
                data: { key: "10K_FOLLOWERS", description: "Reached 10K followers" },
            }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(200);
        const body = await parseResponse(res);
        expect(body.success).toBe(true);
        expect(mockInsertValues).toHaveBeenCalled();
    });

    // --- Edge cases ---
    it("MILESTONE에 bonusAmount가 있으면 relayDepositYield를 호출해야 한다", async () => {
        const { relayDepositYield } = await import("@/lib/relayer");

        const res = await action({
            request: makeRequest({
                type: "MILESTONE",
                data: { key: "BONUS", description: "Bonus milestone", bonusAmount: "100" },
            }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(200);
        expect(relayDepositYield).toHaveBeenCalledWith(101, "100");
    });
});
