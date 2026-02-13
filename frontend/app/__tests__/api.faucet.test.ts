/**
 * api.faucet.ts 단위 테스트
 *
 * 테스트 범위:
 * - 요청 본문 Zod 검증 (주소 형식, 필수 필드)
 * - Rate limiting (24시간 쿨다운, 일일 한도)
 * - 정상 트랜잭션 흐름
 * - 에러 핸들링
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks (vi.mock is hoisted before imports)
// ---------------------------------------------------------------------------

const mockWriteContract = vi.fn();

vi.mock("@/lib/relayer", () => ({
    getRelayerAccount: vi.fn(() => "0xRelayerAccount"),
    getWalletClient: vi.fn(() => ({
        writeContract: mockWriteContract,
    })),
}));

// Track calls to db operations
const mockRecentSelect = vi.fn();
const mockDailySelect = vi.fn();
const mockInsertValues = vi.fn();

// Call counter to differentiate the two db.select() calls in the action
let selectCallCount = 0;

vi.mock("@/db", () => ({
    db: {
        select: (...args: unknown[]) => {
            selectCallCount++;
            // First select(): recent faucet request (per-address rate limit)
            if (selectCallCount % 2 === 1) {
                return {
                    from: () => ({
                        where: () => ({
                            orderBy: () => ({
                                limit: () => mockRecentSelect(),
                            }),
                        }),
                    }),
                };
            }
            // Second select(): daily total
            return {
                from: () => ({
                    where: () => mockDailySelect(),
                }),
            };
        },
        insert: () => ({
            values: mockInsertValues,
        }),
    },
}));

vi.mock("@/db/schema", () => ({
    faucetRequests: {
        address: "address",
        requestedAt: "requestedAt",
        amountUsdc: "amountUsdc",
    },
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
    gte: vi.fn(),
    sql: vi.fn(),
    desc: vi.fn(),
}));

vi.mock("@/config/contracts", () => ({
    CONTRACTS: {
        MockUSDC: {
            address: "0x1234567890123456789012345678901234567890",
            abi: [],
        },
    },
}));

vi.mock("@/config/wagmi", () => ({
    creditcoinTestnet: { id: 102031 },
}));

vi.mock("viem", () => ({
    parseUnits: vi.fn(() => BigInt(500_000_000_000_000_000_000)),
}));

// ---------------------------------------------------------------------------
// Import module under test (after mocks are hoisted)
// ---------------------------------------------------------------------------
import { action } from "@/routes/api.faucet";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown, method = "POST"): Request {
    return new Request("http://localhost:3000/api/faucet", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

async function parseResponse(response: Response) {
    return response.json();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("api.faucet", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        selectCallCount = 0;
        // Default: no prior faucet requests, no daily total
        mockRecentSelect.mockResolvedValue([]);
        mockDailySelect.mockResolvedValue([{ total: 0 }]);
        mockInsertValues.mockResolvedValue(undefined);
        mockWriteContract.mockResolvedValue("0xTxHashMock123");
    });

    // --- Method validation ---
    it("GET 요청을 405로 거부해야 한다", async () => {
        const req = new Request("http://localhost:3000/api/faucet", {
            method: "GET",
        });
        const res = await action({ request: req, params: {}, context: {} as never } as any);
        expect(res.status).toBe(405);
        const body = await parseResponse(res);
        expect(body.error).toBe("Method Not Allowed");
    });

    // --- Body validation ---
    it("빈 body를 400으로 거부해야 한다", async () => {
        const res = await action({
            request: makeRequest({}),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(400);
        const body = await parseResponse(res);
        expect(body.error).toBe("Invalid request");
    });

    it("잘못된 주소 형식을 400으로 거부해야 한다", async () => {
        const res = await action({
            request: makeRequest({ address: "not-an-address" }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(400);
    });

    it("올바른 주소 형식을 허용해야 한다", async () => {
        const validAddress = "0x1234567890abcdef1234567890abcdef12345678";
        const res = await action({
            request: makeRequest({ address: validAddress }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(200);
        const body = await parseResponse(res);
        expect(body.success).toBe(true);
        expect(body.hash).toBeDefined();
    });

    // --- Rate limiting ---
    it("24시간 내 동일 주소 재요청을 429로 거부해야 한다", async () => {
        // Simulate an existing recent request within cooldown
        mockRecentSelect.mockResolvedValue([
            { address: "0x1234567890abcdef1234567890abcdef12345678", requestedAt: Date.now() - 1000 },
        ]);

        const res = await action({
            request: makeRequest({ address: "0x1234567890abcdef1234567890abcdef12345678" }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(429);
        const body = await parseResponse(res);
        expect(body.error).toContain("Rate limit");
    });

    // --- Daily limit ---
    it("일일 한도 초과 시 429를 반환해야 한다", async () => {
        mockRecentSelect.mockResolvedValue([]);
        mockDailySelect.mockResolvedValue([{ total: 10_000 }]);

        const res = await action({
            request: makeRequest({ address: "0x1234567890abcdef1234567890abcdef12345678" }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(429);
        const body = await parseResponse(res);
        expect(body.error).toContain("Daily faucet limit");
    });

    // --- Transaction error ---
    it("트랜잭션 실패 시 500을 반환해야 한다", async () => {
        mockWriteContract.mockRejectedValue(new Error("Insufficient gas"));

        const res = await action({
            request: makeRequest({ address: "0x1234567890abcdef1234567890abcdef12345678" }),
            params: {},
            context: {} as never,
        } as any);
        expect(res.status).toBe(500);
        const body = await parseResponse(res);
        expect(body.success).toBe(false);
        expect(body.error).toContain("Insufficient gas");
    });

    // --- DB insert verification ---
    it("성공 시 DB에 faucet 요청을 기록해야 한다", async () => {
        await action({
            request: makeRequest({ address: "0x1234567890abcdef1234567890abcdef12345678" }),
            params: {},
            context: {} as never,
        } as any);
        expect(mockInsertValues).toHaveBeenCalledTimes(1);
        const insertArg = mockInsertValues.mock.calls[0][0];
        expect(insertArg.address).toBe("0x1234567890abcdef1234567890abcdef12345678");
        expect(insertArg.amountUsdc).toBe(500);
        expect(insertArg.txHash).toBe("0xTxHashMock123");
    });
});
