import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
    Send,
    Bot,
    User,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simple Select implementation since we might not have the full Select component set up or to keep it self-contained
const ModelSelect = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2 mb-4 p-2 bg-neutral-100 rounded-lg w-fit">
        <Settings size={16} className="text-neutral-500" />
        <span className="text-xs font-medium text-neutral-500">Model:</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
        >
            <option value="openai">OpenAI (GPT-4o)</option>
            <option value="google">Google (Gemini 1.5)</option>
        </select>
    </div>
);

export default function AiGuidePage() {
    const [model, setModel] = useState("openai");
    const [input, setInput] = useState("");
    const { messages, sendMessage, status } = useChat();

    const isLoading = status === "submitted" || status === "streaming";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({ text: input }, { body: { model } });
        setInput("");
    };
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">AI Guide Assistant</h1>
                        <p className="text-neutral-500">Ask anything about BondBase, investment strategies, or technical support.</p>
                    </div>
                    <ModelSelect value={model} onChange={setModel} />
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-100 space-y-8 px-4">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
                                        <Bot size={32} className="text-neutral-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg text-neutral-900">BondBase AI Assistant</p>
                                        <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-1">
                                            I can help you with wallet setup, getting testnet tokens, and understanding our yield system.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                    {[
                                        { label: "💳 Get Testnet Tokens", text: "How do I get testnet CTC and MockUSDC?" },
                                        { label: "💰 How to Invest", text: "Explain the bond investment process." },
                                        { label: "📈 Yield System", text: "How does the Hold-to-Earn yield system work?" },
                                        { label: "⚙️ Wallet Setup", text: "Guide me through wallet setup." },
                                    ].map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage({ role: 'user', content: action.text } as any, { body: { model } })}
                                            className="flex items-center gap-3 p-4 bg-white border border-neutral-200 hover:border-neutral-900 hover:shadow-sm rounded-xl text-left transition-all duration-200 group"
                                        >
                                            <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                                                {action.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex gap-4 max-w-[85%]",
                                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    m.role === "user" ? "bg-neutral-900 text-white" : "bg-blue-600 text-white"
                                )}>
                                    {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                {/* Bubble */}
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                                    m.role === "user"
                                        ? "bg-neutral-900 text-white rounded-tr-sm"
                                        : "bg-neutral-50 text-neutral-800 rounded-tl-sm border border-neutral-100"
                                )}>
                                    {m.parts.map((part, index) => (
                                        part.type === 'text' ? <span key={index}>{part.text}</span> : null
                                    ))}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 max-w-[85%] mr-auto">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="p-4 rounded-2xl bg-neutral-50 rounded-tl-sm border border-neutral-100 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
                        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 h-12 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all font-medium"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="h-12 w-12 rounded-xl p-0 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 transition-colors shrink-0"
                            >
                                <Send size={20} />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
