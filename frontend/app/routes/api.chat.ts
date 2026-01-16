import { type ActionFunctionArgs } from "react-router";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import fs from "fs";
import path from "path";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { messages, model = "openai" } = await request.json();

    // Load guides for context
    // Reading from the project root's docs folder. 
    // Process.cwd() in Vite dev server is usually the project root (frontend) or the workspace root depending on how it's launched.
    // Assuming 'frontend' is where the server is running, docs are in ../docs
    const guidePath1 = path.join(process.cwd(), "../docs/guides/user-testing-guide.md");
    const guidePath2 = path.join(process.cwd(), "../docs/guides/yield-operation-guide.md");

    let context = "";
    try {
        // Attempt to read files. If they don't exist (e.g. strict permissions or path issues), fallback gracefully.
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
    // Allow switching models via request body if needed, defaulting to OpenAI
    const modelProvider = model === "google"
        ? google("gemini-1.5-flash")
        : openai("gpt-4o");

    const result = await streamText({
        model: modelProvider,
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
};
