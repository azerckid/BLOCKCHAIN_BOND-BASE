/**
 * ranking.server.ts / api.ranking.ts 단위 테스트
 *
 * 테스트 범위:
 * - maskAddress: 주소 마스킹 포맷
 * - getPeriodStart: 기간별 시작 타임스탬프
 * - GET /api/ranking: 응답 스키마, Cache-Control, period 기본값
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DateTime } from "luxon";

// ---------------------------------------------------------------------------
// Mocks — ranking.server.ts가 @/db를 import하므로 env/db 전체 모킹 필요
// ---------------------------------------------------------------------------

vi.mock("@/lib/env", () => ({
    getEnv: (key: string) => {
        const env: Record<string, string> = {
            TURSO_DATABASE_URL: "file:test.db",
            CHOONSIM_API_KEY: "test-key",
            BETTER_AUTH_SECRET: "test-secret-16chars",
        };
        return env[key];
    },
}));

vi.mock("@/db", () => ({
    db: {
        query: {},
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    dbClient: {
        execute: vi.fn().mockResolvedValue({ rows: [] }),
    },
}));

vi.mock("@/db/schema", () => ({
    yieldDistributions: {},
    investors: { id: "id", walletAddress: "wallet_address", createdAt: "created_at" },
    investments: {},
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
    gte: vi.fn(),
    sql: Object.assign(vi.fn(), { raw: vi.fn() }),
    inArray: vi.fn(),
    and: vi.fn(),
}));

const mockGetRankingData = vi.fn();

vi.mock("@/lib/ranking.server", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/ranking.server")>();
    return {
        ...actual,
        getRankingData: (...args: unknown[]) => mockGetRankingData(...args),
    };
});

// ---------------------------------------------------------------------------
// 1. maskAddress
// ---------------------------------------------------------------------------

describe("maskAddress", () => {
    it("정상 주소를 앞 6자리...뒤 4자리로 마스킹해야 한다", async () => {
        const { maskAddress } = await import("@/lib/ranking.server");
        expect(maskAddress("0x1234567890abcdef1234")).toBe("0x1234...1234");
    });

    it("10자 미만 주소는 그대로 반환해야 한다", async () => {
        const { maskAddress } = await import("@/lib/ranking.server");
        expect(maskAddress("0x123")).toBe("0x123");
    });

    it("정확히 10자인 주소도 마스킹해야 한다", async () => {
        const { maskAddress } = await import("@/lib/ranking.server");
        const addr = "0123456789";
        expect(maskAddress(addr)).toBe("012345...6789");
    });
});

// ---------------------------------------------------------------------------
// 2. getPeriodStart
// ---------------------------------------------------------------------------

describe("getPeriodStart", () => {
    it("'all'은 null을 반환해야 한다", async () => {
        const { getPeriodStart } = await import("@/lib/ranking.server");
        expect(getPeriodStart("all")).toBeNull();
    });

    it("'week'는 이번 주 시작 타임스탬프를 반환해야 한다", async () => {
        const { getPeriodStart } = await import("@/lib/ranking.server");
        const result = getPeriodStart("week");
        expect(result).not.toBeNull();
        const expected = DateTime.now().setZone("Asia/Seoul").startOf("week").toUnixInteger();
        expect(result).toBe(expected);
    });

    it("'month'는 이번 달 시작 타임스탬프를 반환해야 한다", async () => {
        const { getPeriodStart } = await import("@/lib/ranking.server");
        const result = getPeriodStart("month");
        expect(result).not.toBeNull();
        const expected = DateTime.now().setZone("Asia/Seoul").startOf("month").toUnixInteger();
        expect(result).toBe(expected);
    });
});

// ---------------------------------------------------------------------------
// 3. GET /api/ranking
// ---------------------------------------------------------------------------

describe("GET /api/ranking", () => {
    const mockRankingData = {
        period: "week" as const,
        updatedAt: "2026-03-05T00:00:00.000+09:00",
        rankings: [
            { rank: 1, walletAddress: "0x1234...5678", rawAddress: "0x12345678", totalYield: 1000000, bondCount: 2, isMe: false },
            { rank: 2, walletAddress: "0xabcd...ef01", rawAddress: "0xabcdef01", totalYield: 500000, bondCount: 1, isMe: true },
        ],
        myRanking: { rank: 2, totalYield: 500000, bondCount: 1 },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetRankingData.mockResolvedValue(mockRankingData);
    });

    it("200 상태와 JSON 응답을 반환해야 한다", async () => {
        const { loader } = await import("@/routes/api.ranking");
        const req = new Request("http://localhost/api/ranking?period=week");
        const res = await loader({ request: req, params: {}, context: {} } as never);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.period).toBe("week");
        expect(body.rankings).toHaveLength(2);
        expect(body.myRanking).not.toBeNull();
    });

    it("Cache-Control: public, max-age=300 헤더를 포함해야 한다", async () => {
        const { loader } = await import("@/routes/api.ranking");
        const req = new Request("http://localhost/api/ranking");
        const res = await loader({ request: req, params: {}, context: {} } as never);
        expect(res.headers.get("Cache-Control")).toBe("public, max-age=300");
    });

    it("period 파라미터 없으면 week를 기본값으로 사용해야 한다", async () => {
        const { loader } = await import("@/routes/api.ranking");
        const req = new Request("http://localhost/api/ranking");
        await loader({ request: req, params: {}, context: {} } as never);
        expect(mockGetRankingData).toHaveBeenCalledWith("week", null);
    });

    it("잘못된 period 값은 week로 fallback해야 한다", async () => {
        const { loader } = await import("@/routes/api.ranking");
        const req = new Request("http://localhost/api/ranking?period=invalid");
        await loader({ request: req, params: {}, context: {} } as never);
        expect(mockGetRankingData).toHaveBeenCalledWith("week", null);
    });

    it("wallet 파라미터를 소문자로 정규화하여 전달해야 한다", async () => {
        const { loader } = await import("@/routes/api.ranking");
        const req = new Request("http://localhost/api/ranking?wallet=0xABCDEF");
        await loader({ request: req, params: {}, context: {} } as never);
        expect(mockGetRankingData).toHaveBeenCalledWith("week", "0xabcdef");
    });

    it("응답에서 rawAddress가 노출되지 않아야 한다", async () => {
        const { loader } = await import("@/routes/api.ranking");
        const req = new Request("http://localhost/api/ranking?period=week");
        const res = await loader({ request: req, params: {}, context: {} } as never);
        const body = await res.json();
        for (const entry of body.rankings) {
            expect(entry).not.toHaveProperty("rawAddress");
        }
    });
});
