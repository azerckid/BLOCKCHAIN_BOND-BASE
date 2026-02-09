import { type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { streamText, smoothStream } from "ai";
import { openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getEnv } from "@/lib/env";

import knowledgeBase from "../lib/knowledge.json";

const googleProvider = createGoogleGenerativeAI({
    apiKey: (getEnv("GEMINI_API_KEY") || getEnv("GOOGLE_GENERATIVE_AI_API_KEY")) ?? "",
});

const chatBodySchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string().optional(),
            parts: z.array(z.object({ text: z.string() })).optional(),
        })
    ),
    model: z.enum(["google", "openai"]).default("google"),
});

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const origin = request.headers.get("origin");
        const allowedOrigin = new URL(request.url).origin;
        if (origin && origin !== allowedOrigin) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = await request.json();
        const parsed = chatBodySchema.safeParse(body);
        if (!parsed.success) {
            return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        const { messages: rawMessages, model } = parsed.data;

        const messages = rawMessages.map((m) => ({
            role: m.role,
            content: m.content ?? m.parts?.map((p) => p.text).join("\n") ?? "",
        }));

        const context = (knowledgeBase as { source?: string; content?: string }[])
            .map((item) => `\n--- SOURCE: ${item.source} ---\n${item.content}\n`)
            .join("\n");

        const systemPrompt = `
      You are the "BondBase AI Concierge", a sophisticated assistant specialized in ChoonSim AI-Talk IP RWA (Real World Asset) investments on Creditcoin.
      
      Your personality: Professional, encouraging, and an enthusiast of ChoonSim's global fandom growth.
      
      Your knowledge base is strictly limited to the provided context. When answering:
      1. Explain how ChoonSim's AI-Talk subscription revenue is converted into investor yields.
      2. Use specific technical details (Contract addresses, Token standards like ERC-1155) found in the docs.
      3. If asked about "How to invest", explain the flow from Faucet -> Growth Market -> Invest in ChoonSim Bonds.
      4. Explain the "Revenue Share" and "Auto-Reinvest" (Compounding) mechanics specifically for ChoonSim bonds.
      5. IMPORTANT: When helpful, provide direct internal Markdown links to BondBase pages:
         - [Growth Market](/bonds)
         - [Fandom Impact](/impact)
         - [Choonsim Growth](/choonsim)
         - [My Portfolio](/portfolio)
         - [Account Settings](/settings)
      
      CRITICAL:
      - You are focused on the ChoonSim IP ecosystem. If asked about previous Thai SME loans, acknowledge them as "Legacy Pilot Projects" but redirect focus to ChoonSim.
      - Do not hallucinate numbers or addresses.
      - Use Markdown for beautiful formatting (tables, lists, bold text).
      - Always respond as an AI Concierge who is here to make IP investment seamless.

      Context from BondBase & ChoonSim Documents:
      ${context}
      `;

        const modelInstance =
            model === "openai" ? openai("gpt-4o") : googleProvider("gemini-2.5-flash");

        const result = await streamText({
            model: modelInstance,
            system: systemPrompt,
            messages,
            experimental_transform: smoothStream({ delayInMs: 20 }),
        });

        return result.toUIMessageStreamResponse();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
