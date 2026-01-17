import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Tree01Icon,
    UserGroupIcon,
    GlobalIcon,
    LicenseIcon,
    Analytics01Icon
} from "@hugeicons/core-free-icons";
import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { formatUnits } from "viem";

export function ImpactSummary({ bondId }: { bondId: number }) {
    const { data: impact } = useReadContract({
        address: CONTRACTS.OracleAdapter.address as `0x${string}`,
        abi: CONTRACTS.OracleAdapter.abi,
        functionName: "getImpactData",
        args: [BigInt(bondId)],
    });

    if (!impact) return null;

    if (!impact) return null;

    // The contract returns a struct, which wagmi/viem typically parses as an array-like object/tuple 
    // when using ABI. If it's returning a struct object, we can access properties, but let's safely handle both.
    const carbon = (impact as any).carbonReduced || (impact as any)[0] || 0n;
    const jobs = (impact as any).jobsCreated || (impact as any)[1] || 0n;
    const sme = (impact as any).smeSupported || (impact as any)[2] || 0n;
    const reportUrl = (impact as any).reportUrl || (impact as any)[3] || "";

    const metrics = [
        {
            label: "Carbon Reduced",
            value: `${Number(carbon).toLocaleString()}kg`,
            icon: Tree01Icon,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Jobs Created",
            value: Number(jobs).toString(),
            icon: UserGroupIcon,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "SMEs Supported",
            value: Number(sme).toString(),
            icon: GlobalIcon,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {metrics.map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl border border-neutral-100 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-neutral-100 group`}>
                    <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                        <HugeiconsIcon icon={m.icon} size={24} className={m.color} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-black text-neutral-400 tracking-widest">{m.label}</div>
                        <div className="text-xl font-black text-neutral-900 leading-tight">{m.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
