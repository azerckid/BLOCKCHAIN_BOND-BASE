import { type ActionFunctionArgs } from "react-router";
import { streamText, smoothStream } from "ai";
import { openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import knowledgeBase from "../lib/knowledge.json";

// Explicitly configure Google provider if needed to map GEMINI_API_KEY
const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const body = await request.json();
        const { messages: rawMessages, model = "google" } = body;

        console.log(`[API Chat] Received request. Model: ${model}, Messages: ${rawMessages?.length}`);

        if (!rawMessages || !Array.isArray(rawMessages)) {
            return new Response(JSON.stringify({ error: "Messages are required" }), { status: 400 });
        }

        // Normalize messages: AI SDK expects 'content' as a string or array of parts.
        const messages = rawMessages.map((m: any) => ({
            role: m.role,
            content: m.content || m.parts?.map((p: any) => p.text).join("\n") || ""
        }));

        // Use pre-bundled knowledge from JSON (generated during build)
        const context = (knowledgeBase as any[]).map(item => {
            return `\n--- SOURCE: ${item.source} ---\n${item.content}\n`;
        }).join("\n");

        const systemPrompt = `
      You are the "BondBase AI Concierge", a sophisticated assistant for an RWA (Real World Asset) investment platform on Creditcoin.
      
      Your personality: Professional, encouraging, and deeply technical yet accessible.
      
      Your knowledge base is strictly limited to the provided context. When answering:
      1. Use specific technical details (Contract addresses, Chain IDs, Token standards like ERC-1155) found in the docs.
      2. If asked about "How to invest", explain the flow from Faucet -> Bond Market -> Invest.
      3. If asked about yields, explain "Hold to Earn" and "Reinvest" (Compounding) mechanics.
      5. IMPORTANT: When helpful, provide direct internal Markdown links to BondBase pages:
         - [Bond Market](/bonds)
         - [My Portfolio](/portfolio)
         - [Impact Map](/impact)
         - [Account Settings](/settings)
         - [Admin Dashboard](/admin)
      
      CRITICAL:
      - If the information is not in the context, clearly state that you don't have that specific data but suggest where they might look (e.g., "official discord" or "block explorer").
      - Do not hallucinate numbers or addresses.
      - Use Markdown for beautiful formatting (tables, lists, bold text).
      - Always respond as an AI Concierge who is here to make RWA investment seamless.

      Context from BondBase Master Documents:
      ${context}
      `;

        // Select model provider based on user preference or default
        // Defaulting to Google Gemini 2.0 Flash
        const modelInstance = model === "openai"
            ? openai("gpt-4o")
            : googleProvider("gemini-2.0-flash-exp");

        const result = await streamText({
            model: modelInstance,
            system: systemPrompt,
            messages,
            // experimental_transform: smoothStream() provides the character-by-character typing feel
            experimental_transform: smoothStream({ delayInMs: 20 }),
        });

        console.log(`[API Chat] Streaming started for model: ${model}`);

        // toUIMessageStreamResponse is the standard way in this SDK version to return 
        // a structured stream that handles multiple parts (text, tools, etc.)
        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("[API Chat Error]:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
