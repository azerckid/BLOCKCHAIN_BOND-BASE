import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    HelpCircleIcon,
    Cancel01Icon,
    Book02Icon,
    Home01Icon,
    Database01Icon,
    Wallet01Icon,
    Settings02Icon,
    InformationCircleIcon,
    Shield01Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GUIDE_SECTIONS = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: Home01Icon,
        color: "text-blue-600",
        bg: "bg-blue-50",
        content: "플랫폼 전체에 예치된 총 자산 규모(TVL), 연이율(APR) 정보, 자산 배분 현황을 차트로 확인하는 종합 상황실입니다. 내 투동 자산 규모와 성과 추이를 직관적으로 파악할 수 있습니다."
    },
    {
        id: "market",
        title: "Growth Market",
        icon: Database01Icon,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        content: "춘심 IP의 미래 수익권(Growth Bond)을 탐색하고 투자하는 곳입니다. 'Approve(승인)' 단계를 거쳐 'Deposit(투자)'을 실행하면 Growth Bond 토큰을 지급받게 됩니다. Revenue Share로 발생하는 수익을 자동으로 누적받습니다."
    },
    {
        id: "portfolio",
        title: "My Portfolio",
        icon: Wallet01Icon,
        color: "text-green-600",
        bg: "bg-green-50",
        content: "오라클이 검증한 실시간 'Revenue Share 트래커'를 통해 내 수익 배분 현황을 확인하세요. 'Claim'으로 수익을 지갑으로 인출하거나, 'Reinvest'로 복리 효과를 누릴 수 있습니다. 'PROOF' 링크로 오라클 검증 증빙도 열람 가능합니다."
    },
    {
        id: "settings",
        title: "Settings",
        icon: Settings02Icon,
        color: "text-neutral-600",
        bg: "bg-neutral-50",
        content: "지갑 연결 상태와 네트워크를 관리합니다. 테스트넷 환경에서는 'Faucet'을 통해 무료로 테스트용 USDC를 민팅하여 모든 투자 과정을 위험 부담 없이 체험해볼 수 있습니다."
    }
];

export function HelpGuide() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            {/* Global Help Toggle Button */}
            <div className="fixed bottom-8 right-8 z-[100] group">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-neutral-900 border-4 border-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group-hover:bg-neutral-800"
                >
                    <HugeiconsIcon icon={HelpCircleIcon} size={32} className="text-white" />
                </Button>
            </div>

            {/* Help Drawer Overlay */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white z-[101] shadow-2xl border-l border-neutral-200 transition-transform duration-500 ease-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                            <HugeiconsIcon icon={Book02Icon} size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-neutral-900 uppercase">BondBase Center</h2>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Mastering the Platform</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl hover:bg-neutral-100 text-neutral-400 transition-colors"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} size={24} />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={InformationCircleIcon} size={20} className="text-indigo-600" />
                            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest leading-none">Introduction</h3>
                        </div>
                        <p className="text-lg font-bold text-neutral-900 italic leading-relaxed">
                            "실물 자산과 온체인 수입을 연결하는 본드베이스의 모든 기능을 안내합니다."
                        </p>
                    </div>

                    <div className="space-y-8">
                        {GUIDE_SECTIONS.map((section) => (
                            <div key={section.id} className="group relative">
                                <div className="flex items-start gap-6">
                                    <div className={cn(
                                        "w-14 h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                                        section.bg,
                                        section.color
                                    )}>
                                        <HugeiconsIcon icon={section.icon} size={28} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-neutral-900 group-hover:text-indigo-600 transition-colors">
                                            {section.title}
                                        </h4>
                                        <p className="text-sm font-medium text-neutral-500 leading-relaxed">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-600 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-neutral-900 rounded-[2rem] text-white space-y-4 relative overflow-hidden">
                        <div className="relative z-10 space-y-1">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Technical Support</p>
                            <h4 className="text-lg font-bold">오라클 투명성 엔진</h4>
                            <p className="text-xs text-neutral-400 font-medium opacity-80 leading-relaxed">
                                본드베이스의 모든 수익 배분(Revenue Share) 데이터는 검증된 오라클 노드에 의해 온체인에 기록되며, 투자자는 언제든지 증빙(Proof)을 확인할 수 있습니다.
                            </p>
                        </div>
                        <div className="absolute -bottom-8 -right-8 opacity-10">
                            <HugeiconsIcon icon={ShieldTickIcon} size={120} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 pt-0">
                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full h-14 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 font-black rounded-2xl border border-neutral-100 transition-all active:scale-95"
                    >
                        GOT IT, THANKS!
                    </Button>
                </div>

                {/* Backdrop toggle (only when open) */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/10 backdrop-blur-[2px] -z-10 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </div>
        </>
    );
}

const ShieldTickIcon = Shield01Icon;
