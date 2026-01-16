import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
    Send,
    Bot,
    User,
    Settings,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

const ModelSelect = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2 mb-4 p-2 bg-neutral-100/50 border border-neutral-200/50 rounded-xl w-fit">
        <Settings size={14} className="text-neutral-500" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Model</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-neutral-700"
        >
            <option value="google">Gemini 2.0</option>
            <option value="openai">GPT-4o</option>
        </select>
    </div>
);

export default function AiGuidePage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [model, setModel] = useState("google");
    const [input, setInput] = useState("");

    // In @ai-sdk/react 3.0.40/ai 6.0.38, useChat uses a transport-based architecture.
    // DefaultChatTransport handles the standard fetch to the provided API.
    const {
        messages,
        sendMessage,
        status,
        setMessages,
        error
    } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
        onError: (err) => {
            console.error("Chat Error:", err);
        }
    });

    const isLoading = status === "submitted" || status === "streaming";

    const onCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoading) return;

        console.log("Sending message:", currentInput, "Model:", model);

        sendMessage({ text: currentInput }, {
            body: { model }
        } as any).catch(err => {
            console.error("SendMessage Error:", err);
        });

        setInput("");
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleQuickAction = (text: string) => {
        sendMessage({ text }, {
            body: { model }
        } as any);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900">AI Guide Assistant</h1>
                        <p className="text-neutral-500 font-medium italic">Your personalized concierge for RWA investments.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setMessages([])}
                            disabled={messages.length === 0}
                            className="rounded-xl border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-all active:scale-95"
                        >
                            <RotateCcw size={18} />
                        </Button>
                        <ModelSelect value={model} onChange={setModel} />
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white border border-neutral-200 rounded-[2rem] shadow-xl shadow-neutral-200/50 overflow-hidden flex flex-col relative group">
                    {/* Glass Decor */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent opacity-50" />

                    {/* Messages Container */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-12 py-10">
                                <div className="space-y-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                                        <div className="relative w-24 h-24 bg-neutral-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-neutral-500/20">
                                            <Bot size={48} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="font-black text-3xl text-neutral-900 tracking-tight">BondBase Assistant</h2>
                                        <p className="text-sm font-medium text-neutral-400 max-w-sm mx-auto leading-relaxed">
                                            Simplifying Web3 RWA investments for everyone.
                                            How can I assist your journey today?
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                                    {[
                                        { label: "💳 Get Testnet Tokens", text: "How do I get testnet CTC and MockUSDC?" },
                                        { label: "💰 How to Invest", text: "Explain the bond investment process step by step." },
                                        { label: "📈 Yield System", text: "How does the Hold-to-Earn and Auto-compounding work?" },
                                        { label: "⚙️ Wallet Setup", text: "Guide me through MetaMask installation and network setup." },
                                    ].map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickAction(action.text)}
                                            className="flex items-center gap-4 p-5 bg-neutral-50/50 border border-neutral-100/50 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white rounded-3xl text-left transition-all duration-300 group/btn shadow-sm hover:shadow-xl hover:shadow-neutral-200 hover:-translate-y-1"
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center group-hover/btn:bg-neutral-800 group-hover/btn:border-neutral-700 transition-all">
                                                <Send size={16} className="text-neutral-400 group-hover/btn:text-white" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-tight">
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
                                    "flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-110",
                                    m.role === "user"
                                        ? "bg-neutral-900 text-white shadow-neutral-200"
                                        : "bg-blue-600 text-white shadow-blue-200"
                                )}>
                                    {m.role === "user" ? <User size={20} /> : <Bot size={20} />}
                                </div>

                                {/* Bubble */}
                                <div className={cn(
                                    "p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                                    m.role === "user"
                                        ? "bg-neutral-900 text-white rounded-tr-sm font-medium"
                                        : "bg-neutral-50 text-neutral-800 rounded-tl-sm border border-neutral-100 font-medium"
                                )}>
                                    <div className="space-y-4">
                                        {m.parts && m.parts.length > 0 ? (
                                            m.parts.map((part, idx) => {
                                                if (part.type === 'text') {
                                                    return <div key={idx} className="whitespace-pre-wrap">{part.text}</div>;
                                                }
                                                return null;
                                            })
                                        ) : (
                                            <div className="whitespace-pre-wrap">{(m as any).content || "..."}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                                Error: {error.message || "Failed to connect to AI server. Please check your connection."}
                            </div>
                        )}

                        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                            <div className="flex gap-4 max-w-[85%] mr-auto animate-in fade-in duration-300">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                                    <Bot size={20} />
                                </div>
                                <div className="p-5 rounded-[1.5rem] bg-neutral-50 rounded-tl-sm border border-neutral-100 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-neutral-100/50 backdrop-blur-sm">
                        <form onSubmit={onCustomSubmit} className="flex gap-3 items-center">
                            <div className="flex-1 relative group">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about investment, yields, or technical setup..."
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-3xl pl-6 pr-14 h-16 focus:outline-none focus:ring-4 focus:ring-neutral-900/5 focus:bg-white focus:border-neutral-900 transition-all font-bold text-neutral-800 placeholder:text-neutral-400 shadow-inner"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-300 opacity-0 group-focus-within:opacity-100 transition-opacity uppercase tracking-widest hidden sm:block">
                                    Press Enter
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="h-16 w-16 rounded-3xl p-0 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-2xl shadow-neutral-200 transition-all shrink-0 group/send"
                            >
                                <Send size={28} className="text-white group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
