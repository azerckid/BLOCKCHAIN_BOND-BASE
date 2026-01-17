import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Location01Icon,
    Calendar01Icon,
    ChartBreakoutCircleIcon,
    ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import * as React from "react";
import { InvestmentModal } from "./investment-modal";
import { toast } from "sonner";
import { useFetcher } from "react-router";

export interface BondProps {
    id: string;
    title: string;
    description: string;
    apr: number;
    term: string;
    location: string;
    totalAmount: string;
    remainingAmount: string;
    loanAmount: number;
    status: "active" | "funded" | "pending";
    category: string;
}

export function BondCard({ bond }: { bond: BondProps }) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const fetcher = useFetcher();

    const progress = (1 - (parseFloat(bond.remainingAmount.replace(/[^0-9.]/g, '')) / parseFloat(bond.totalAmount.replace(/[^0-9.]/g, '')))) * 100;

    const handleInvest = (amount: number) => {
        fetcher.submit(
            { amount: amount.toString(), bondId: bond.id },
            { method: "post", action: "/bonds" }
        );
    };

    React.useEffect(() => {
        if (fetcher.state === "submitting") {
            toast.loading(`Processing investment for ${bond.title}...`, { id: "invest-loading" });
        }
        if (fetcher.state === "idle" && fetcher.data) {
            toast.dismiss("invest-loading");
            toast.success("Investment successful!", {
                description: `You've successfully invested across Creditcoin.`,
            });
            setIsModalOpen(false);
        }
    }, [fetcher.state, fetcher.data, bond.title]);

    return (
        <>
            <Card className="group overflow-hidden border-neutral-200/60 hover:border-neutral-900/10 hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-300 bg-white">
                <CardHeader className="p-0">
                    <div className="relative h-48 overflow-hidden bg-neutral-900">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950 opacity-90 transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <div className="text-center space-y-2">
                                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md mb-2">
                                    {bond.category}
                                </Badge>
                                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                                    {bond.title}
                                </h3>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 focus-visible:outline-none">
                            <Badge variant={bond.status === "active" ? "default" : "secondary"} className={cn(
                                "shadow-sm",
                                bond.status === "active" ? "bg-green-500 hover:bg-green-600 border-none" : ""
                            )}>
                                {bond.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Target yield</p>
                            <div className="flex items-center gap-1.5 text-neutral-900">
                                <HugeiconsIcon icon={ChartBreakoutCircleIcon} size={18} className="text-neutral-900" />
                                <p className="text-lg font-bold">{bond.apr}% <span className="text-xs font-normal text-neutral-500">APR</span></p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Duration</p>
                            <div className="flex items-center gap-1.5 text-neutral-900">
                                <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-neutral-600" />
                                <p className="text-lg font-bold">{bond.term}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Funding Progress</p>
                                <p className="text-sm font-bold text-neutral-900">{((100 - (progress)) / 10).toFixed(1)}M remaining</p>
                            </div>
                            <p className="text-sm font-black text-neutral-900">{Math.round(progress)}%</p>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-neutral-900 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-500 pt-2 border-t border-neutral-100">
                        <HugeiconsIcon icon={Location01Icon} size={16} />
                        <span className="text-xs font-medium">{bond.location}</span>
                    </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full group/btn rounded-xl bg-neutral-900 hover:bg-black text-white py-6 h-auto transition-all"
                    >
                        <span>Invest Now</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </CardFooter>
            </Card>

            <InvestmentModal
                bond={bond}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onInvest={handleInvest}
            />
        </>
    );
}
