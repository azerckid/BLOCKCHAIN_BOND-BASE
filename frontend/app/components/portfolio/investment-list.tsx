import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Clock01Icon,
    Tick02Icon
} from "@hugeicons/core-free-icons";

const INVESTMENTS = [
    {
        id: "1",
        title: "SME Working Capital - Bangkok",
        amount: "$12,450",
        yield: "$312.45",
        apr: 12.5,
        status: "Active",
        endDate: "Feb 2026",
    },
    {
        id: "2",
        title: "Agriculture Supply Chain",
        amount: "$5,000",
        yield: "$125.00",
        apr: 14.2,
        status: "Repaid",
        endDate: "Dec 2025",
    },
    {
        id: "3",
        title: "Logistics Fleet Expansion",
        amount: "$8,200",
        yield: "$42.10",
        apr: 13.5,
        status: "Active",
        endDate: "Jun 2026",
    }
];

export function InvestmentList() {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">My Investments</h3>
            <div className="grid gap-4">
                {INVESTMENTS.map((inv) => (
                    <div
                        key={inv.id}
                        className="bg-white border border-neutral-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-900/10 hover:shadow-lg transition-all"
                    >
                        <div className="flex gap-4 items-center">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inv.status === "Active" ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"
                                }`}>
                                <HugeiconsIcon icon={inv.status === "Active" ? Clock01Icon : Tick02Icon} size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral-900">{inv.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                                    <span>{inv.amount} invested</span>
                                    <span>•</span>
                                    <span>{inv.apr}% APR</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-10">
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Yield earned</p>
                                <p className="text-lg font-black text-neutral-900">{inv.yield}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">End Date</p>
                                <p className="text-sm font-bold text-neutral-900">{inv.endDate}</p>
                            </div>
                            <div className="hidden sm:block">
                                <Badge variant={inv.status === "Active" ? "default" : "secondary"} className={
                                    inv.status === "Active" ? "bg-green-500 hover:bg-green-600 border-none" : ""
                                }>
                                    {inv.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
