import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    SentIcon,
    AiCloudIcon,
    UserIcon,
    Settings02Icon,
    AiChat02Icon,
    ZapIcon,
    WasteIcon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ModelSelect = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2 p-1.5 bg-neutral-100/80 border border-neutral-200/50 rounded-xl backdrop-blur-sm self-center">
        <HugeiconsIcon icon={Settings02Icon} size={14} className="text-neutral-500" />
        <span className="text-[10px] uppercase font-black text-neutral-400 tracking-widest hidden sm:inline">Engine</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent text-[11px] font-black focus:outline-none cursor-pointer text-neutral-900 border-none p-0 h-4"
        >
            <option value="google">GEMINI 2.0</option>
            <option value="openai">GPT-4O</option>
        </select>
    </div>
);

export default function AiGuidePage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [model, setModel] = useState("google");
    const [input, setInput] = useState("");

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
    }, [messages, status]);

    const handleQuickAction = (text: string) => {
        sendMessage({ text }, {
            body: { model }
        } as any);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6">
                {/* Header Header */}
                <div className="flex items-end justify-between px-4 sm:px-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center shadow-lg shadow-neutral-200">
                                <HugeiconsIcon icon={AiChat02Icon} size={24} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-neutral-900">AI Concierge</h1>
                        </div>
                        <p className="text-neutral-400 font-bold text-sm ml-1">Smart guide for BondBase RWA Investments.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMessages([])}
                            disabled={messages.length === 0}
                            className="h-9 px-3 text-[10px] font-black uppercase text-neutral-400 hover:text-red-600 transition-colors gap-2"
                        >
                            <HugeiconsIcon icon={WasteIcon} size={14} />
                            RESET
                        </Button>
                        <ModelSelect value={model} onChange={setModel} />
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white border border-neutral-200 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col relative">
                    {/* Background Subtle Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/50 to-transparent pointer-events-none" />

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-6 py-8 space-y-8 relative z-10 scroll-smooth"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-12">
                                <div className="space-y-6 flex flex-col items-center">
                                    <div className="relative">
                                        <div className="absolute -inset-8 bg-indigo-50 rounded-full blur-3xl opacity-50 animate-pulse" />
                                        <div className="relative w-28 h-28 bg-neutral-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-neutral-900/20 group">
                                            <HugeiconsIcon icon={AiCloudIcon} size={48} className="text-white transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="font-black text-3xl text-neutral-900 tracking-tighter uppercase">Assistant Ready</h2>
                                        <p className="text-sm font-bold text-neutral-400 max-w-sm mx-auto leading-relaxed italic">
                                            How can I help you navigate the <span className="text-neutral-900">BondBase ecosystem</span> today?
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                                    {[
                                        { label: "💳 Get Testnet Tokens", text: "How do I get testnet CTC and MockUSDC?" },
                                        { label: "💰 How to Invest", text: "Explain the bond investment process step by step." },
                                        { label: "📈 Yield System", text: "How does the Hold-to-Earn and Auto-compounding work?" },
                                        { label: "⚙️ Wallet Setup", text: "Guide me through MetaMask installation and network setup." },
                                    ].map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickAction(action.text)}
                                            className="flex items-center gap-4 p-5 bg-white border border-neutral-100 hover:border-neutral-900 hover:bg-neutral-950 hover:text-white rounded-[1.5rem] text-left transition-all duration-300 group/btn shadow-sm hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover/btn:bg-neutral-800 group-hover/btn:border-neutral-700 transition-all shrink-0">
                                                <HugeiconsIcon icon={ZapIcon} size={16} className="text-neutral-500 group-hover/btn:text-white" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-tight leading-tight">
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
                                    "flex gap-4 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-300 hover:scale-110",
                                    m.role === "user"
                                        ? "bg-neutral-900 text-white shadow-neutral-200"
                                        : "bg-indigo-600 text-white shadow-indigo-100"
                                )}>
                                    <HugeiconsIcon icon={m.role === "user" ? UserIcon : AiCloudIcon} size={20} />
                                </div>

                                <div className={cn(
                                    "px-6 py-4 rounded-[2rem] text-[13px] leading-relaxed shadow-sm transition-all",
                                    m.role === "user"
                                        ? "bg-neutral-900 text-white rounded-tr-sm font-medium"
                                        : "bg-neutral-50 text-neutral-800 rounded-tl-sm border border-neutral-100 font-medium"
                                )}>
                                    <div className="prose prose-sm max-w-none prose-neutral dark:prose-invert prose-p:leading-relaxed prose-pre:bg-neutral-900 prose-pre:text-white prose-code:text-indigo-600 prose-strong:text-neutral-900">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.parts && m.parts.length > 0
                                                ? m.parts.map(p => p.type === 'text' ? p.text : '').join('')
                                                : (m as any).content || ""
                                            }
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black animate-in shake duration-300 uppercase tracking-widest text-center">
                                Connection Error: {error.message || "Failed to reach AI Engine"}
                            </div>
                        )}

                        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                            <div className="flex gap-4 max-w-[85%] mr-auto animate-in fade-in duration-300">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                                    <HugeiconsIcon icon={AiCloudIcon} size={20} />
                                </div>
                                <div className="px-5 py-3 rounded-[1.5rem] bg-neutral-50 rounded-tl-sm border border-neutral-100 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2.5 h-2.5 bg-indigo-700 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-neutral-100 relative z-20">
                        <form onSubmit={onCustomSubmit} className="flex gap-3 items-center">
                            <div className="flex-1 relative group">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about dividends, oracle proof, or wallet setup..."
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-[1.5rem] pl-6 pr-14 h-14 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:bg-white focus:border-neutral-900 transition-all font-bold text-neutral-800 placeholder:text-neutral-300 shadow-inner"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-neutral-100 px-2 py-1 rounded text-[9px] font-black text-neutral-400 opacity-0 group-focus-within:opacity-100 transition-opacity uppercase tracking-widest hidden sm:block">
                                    Enter
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="h-14 w-14 rounded-[1.5rem] p-0 flex items-center justify-center bg-neutral-900 hover:bg-neutral-950 hover:scale-105 active:scale-95 shadow-xl shadow-neutral-200 transition-all shrink-0 group/send"
                            >
                                <HugeiconsIcon icon={SentIcon} size={24} className="text-white transition-transform group-hover/send:translate-x-1 group-hover/send:-translate-y-1" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
