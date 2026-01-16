import { type ActionFunctionArgs } from "react-router";
import { streamText, smoothStream } from "ai";
import { openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import fs from "fs";
import path from "path";

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

        // Load guides for context
        const guidePath1 = path.join(process.cwd(), "../docs/guides/user-testing-guide.md");
        const guidePath2 = path.join(process.cwd(), "../docs/guides/yield-operation-guide.md");

        let context = "";
        try {
            const guide1 = fs.existsSync(guidePath1) ? fs.readFileSync(guidePath1, "utf-8") : "";
            const guide2 = fs.existsSync(guidePath2) ? fs.readFileSync(guidePath2, "utf-8") : "";

            context = `
        [User Testing Guide]
        ${guide1}

        [Yield Operation Guide]
        ${guide2}
        `;
        } catch (error) {
            console.error("Failed to load guide docs:", error);
            context = "Guide documents are currently unavailable.";
        }

        const systemPrompt = `
      You are the AI Guide Assistant for BondBase, an RWA (Real World Asset) investment platform.
      Your goal is to help users understand how to use the platform, specifically focusing on:
      1. Wallet setup and network configuration (Creditcoin Testnet).
      2. Getting testnet tokens (CTC via faucet) and investment funds (MockUSDC).
      3. The investment process (Bond Market -> Invest).
      4. Understanding the yield system (Hold to Earn, Reinvest/Auto-Compounding).

      Use the following documentation context to answer user questions accurately.
      If the answer is not in the context, politely say you don't know and advise checking the official docs or asking an admin.
      Do not hallucinate features that are not mentioned.
      
      Format your response in Markdown.

      Context:
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
            // experimental_transform: smoothStream() enables the "powerful control" over streaming speed,
            // allowing us to provide a better UX by smoothing out the chunk delivery.
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
