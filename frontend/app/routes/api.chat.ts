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

        // Select model provider based on user preference or default
        // Upgraded to Gemini 2.0 Flash as per user request
        const modelInstance = model === "openai"
            ? openai("gpt-4o")
            : googleProvider("gemini-2.5-flash"); // Changed to gemini-2.5-flash as per user request

        // Initialize Viem Client for Creditcoin Testnet
        const { createPublicClient, http, defineChain } = await import("viem");
        const creditcoinTestnet = defineChain({
            id: 102031,
            name: "Creditcoin Testnet",
            nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
            rpcUrls: { default: { http: ["https://rpc.cc3-testnet.creditcoin.network"] } },
            blockExplorers: { default: { name: "Creditcoin Explorer", url: "https://explorer.creditcoin.org" } },
        });

        const client = createPublicClient({
            chain: creditcoinTestnet,
            transport: http()
        });

        const result = await streamText({
            model: modelInstance,
            system: systemPrompt,
            messages,
            // tools: { ... } removed due to Gemini API schema compatibility issues
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
