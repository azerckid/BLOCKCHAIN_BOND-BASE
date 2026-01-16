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

        // Dynamically load all relevant knowledge from the public/docs directory
        // In Remix/React Router v7, process.cwd() is the project root (frontend/)
        const docsDir = path.join(process.cwd(), "public/docs");
        const ignoreDirs = ["archive"];

        const getAllFiles = (dir: string, fileList: string[] = []) => {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    if (!ignoreDirs.includes(file)) {
                        getAllFiles(filePath, fileList);
                    }
                } else if (file.endsWith(".md")) {
                    fileList.push(filePath);
                }
            });
            return fileList;
        };

        let context = "";
        try {
            const allDocPaths = getAllFiles(docsDir);
            context = allDocPaths.map(filePath => {
                const content = fs.readFileSync(filePath, "utf-8");
                const relativeName = path.relative(docsDir, filePath);
                return `\n--- SOURCE: ${relativeName} ---\n${content}\n`;
            }).join("\n");
        } catch (error) {
            console.error("Failed to load knowledge base:", error);
            context = "Knowledge base documents are partially unavailable.";
        }

        const systemPrompt = `
      You are the "BondBase AI Concierge", a sophisticated assistant for an RWA (Real World Asset) investment platform on Creditcoin.
      
      Your personality: Professional, encouraging, and deeply technical yet accessible.
      
      Your knowledge base is strictly limited to the provided context. When answering:
      1. Use specific technical details (Contract addresses, Chain IDs, Token standards like ERC-1155) found in the docs.
      2. If asked about "How to invest", explain the flow from Faucet -> Bond Market -> Invest.
      3. If asked about yields, explain "Hold to Earn" and "Reinvest" (Compounding) mechanics.
      4. If user asks in Korean, answer in Korean.
      
      CRITICAL:
      - If the information is not in the context, clearly state that you don't have that specific data but suggest where they might look (e.g., "official discord" or "block explorer").
      - Do not hallucinate numbers or addresses.
      - Use Markdown for beautiful formatting (tables, lists, bold text).

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
