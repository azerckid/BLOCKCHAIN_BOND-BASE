/**
 * api.chat.ts 단위 테스트
 *
 * 테스트 범위:
 * - Origin 검증 (CORS 보호)
 * - 요청 본문 Zod 검증 (messages 배열, model 열거형)
 * - 에러 핸들링
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/env", () => ({
    getEnv: () => "test-api-key",
}));

const mockToUIMessageStreamResponse = vi.fn(
    () => new Response("streamed", { status: 200 }),
);

vi.mock("ai", () => ({
    streamText: vi.fn().mockResolvedValue({
        toUIMessageStreamResponse: () => mockToUIMessageStreamResponse(),
    }),
    smoothStream: vi.fn(() => "smooth-transform"),
}));

vi.mock("@ai-sdk/openai", () => ({
    openai: vi.fn(() => "openai-model"),
}));

vi.mock("@ai-sdk/google", () => ({
    createGoogleGenerativeAI: vi.fn(() => vi.fn(() => "google-model")),
}));

vi.mock("@/lib/knowledge.json", () => ({
    default: [
        { source: "test-doc.md", content: "BondBase is a platform for bond investments." },
    ],
}));

// ---------------------------------------------------------------------------
// Import module under test
// ---------------------------------------------------------------------------
import { action } from "@/routes/api.chat";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
    body: unknown,
    options?: { origin?: string; method?: string },
): Request {
    const url = "http://localhost:3000/api/chat";
    const method = options?.method ?? "POST";
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (options?.origin) {
        headers["origin"] = options.origin;
    }
    return new Request(url, {
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

describe("api.chat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockToUIMessageStreamResponse.mockReturnValue(
            new Response("streamed", { status: 200 }),
        );
    });

    // --- Origin validation ---
    it("다른 origin에서의 요청을 403으로 거부해야 한다", async () => {
        const res = await action({
            request: makeRequest(
                { messages: [{ role: "user", content: "hello" }], model: "google" },
                { origin: "http://evil.example.com" },
            ),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(403);
        const body = await parseResponse(res);
        expect(body.error).toBe("Forbidden");
    });

    it("같은 origin에서의 요청을 허용해야 한다", async () => {
        const res = await action({
            request: makeRequest(
                { messages: [{ role: "user", content: "hello" }], model: "google" },
                { origin: "http://localhost:3000" },
            ),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(200);
    });

    // --- Body validation ---
    it("messages가 없으면 400으로 거부해야 한다", async () => {
        const res = await action({
            request: makeRequest({ model: "google" }),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(400);
        const body = await parseResponse(res);
        expect(body.error).toBe("Invalid request");
    });

    it("잘못된 role값을 400으로 거부해야 한다", async () => {
        const res = await action({
            request: makeRequest({
                messages: [{ role: "hacker", content: "hello" }],
                model: "google",
            }),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(400);
    });

    it("지원하지 않는 model값을 400으로 거부해야 한다", async () => {
        const res = await action({
            request: makeRequest({
                messages: [{ role: "user", content: "hello" }],
                model: "claude",
            }),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(400);
    });

    // --- Success flows ---
    it("유효한 요청을 성공적으로 스트리밍 해야 한다", async () => {
        const res = await action({
            request: makeRequest({
                messages: [
                    { role: "user", content: "What is BondBase?" },
                ],
                model: "google",
            }),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(200);
        expect(mockToUIMessageStreamResponse).toHaveBeenCalled();
    });

    it("model 기본값이 google이어야 한다", async () => {
        const res = await action({
            request: makeRequest({
                messages: [{ role: "user", content: "hello" }],
            }),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(200);
    });

    it("parts 형태의 메시지도 처리할 수 있어야 한다", async () => {
        const res = await action({
            request: makeRequest({
                messages: [
                    { role: "user", parts: [{ text: "What is BondBase?" }] },
                ],
                model: "google",
            }),
            params: {},
            context: {} as never,
        });
        expect(res.status).toBe(200);
    });
});
