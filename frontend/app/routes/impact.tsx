import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    GlobalIcon,
    Tree01Icon,
    UserGroupIcon,
    Analytics01Icon,
    Location01Icon,
    Chart01Icon,
    Settings02Icon
} from "@hugeicons/core-free-icons";
import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { MOCK_BONDS } from "./bonds";
import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

const STAT_CARDS = [
    { label: "Total Carbon Reduced", value: "2,430 kg", icon: Tree01Icon, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Jobs Created", value: "48", icon: UserGroupIcon, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Community ESG Score", value: "A+", icon: Analytics01Icon, color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function ImpactPage() {
    const [activeBond, setActiveBond] = useState(MOCK_BONDS[0]);

    // In a real app, we would aggregate all bonds' impact data
    const { data: impact } = useReadContract({
        address: CONTRACTS.OracleAdapter.address as `0x${string}`,
        abi: CONTRACTS.OracleAdapter.abi,
        functionName: "getImpactData",
        args: [BigInt(activeBond.id)],
    });

    const impactData = impact ? {
        carbon: Number((impact as any)[0]),
        jobs: Number((impact as any)[1]),
        sme: Number((impact as any)[2]),
        url: (impact as any)[3]
    } : { carbon: 0, jobs: 0, sme: 0, url: "" };

    const chartData = [
        { name: "Carbon (kg/10)", value: impactData.carbon / 10 },
        { name: "Jobs x10", value: impactData.jobs * 10 },
        { name: "SMEs Support", value: impactData.sme * 50 },
    ];

    const COLORS = ["#10b981", "#3b82f6", "#6366f1"];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-xl shadow-neutral-200">
                                <HugeiconsIcon icon={GlobalIcon} size={28} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-neutral-900 uppercase">Impact Transparency</h1>
                        </div>
                        <p className="text-neutral-500 font-bold ml-1 italic">Real-time ESG verification powered by Oracle & On-chain Proofs.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STAT_CARDS.map((stat, i) => (
                        <div key={i} className="bg-white border border-neutral-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase font-black text-neutral-400 tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-neutral-900">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                <HugeiconsIcon icon={stat.icon} size={24} className={stat.color} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left: Interactive Map/Visualization (Stylized) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-neutral-900 rounded-[3rem] p-8 min-h-[500px] relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl shadow-neutral-200 group">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                            {/* Stylized Africa SVG or Map Placeholder */}
                            <div className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                                <div className="text-white space-y-4">
                                    <HugeiconsIcon icon={Location01Icon} size={64} className="mx-auto text-indigo-400 animate-bounce" />
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">BondBase Global Impact Hub</h2>
                                    <p className="text-neutral-400 font-bold max-w-sm mx-auto leading-relaxed">
                                        Visualizing social and environmental pulse across our investment regions.
                                    </p>

                                    {/* Active Pulse Markers */}
                                    <div className="flex gap-2 flex-wrap justify-center mt-12 px-4">
                                        {MOCK_BONDS.map((bond) => (
                                            <button
                                                key={bond.id}
                                                onClick={() => setActiveBond(bond)}
                                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border ${activeBond.id === bond.id
                                                    ? 'bg-white text-neutral-900 border-white scale-110 shadow-lg'
                                                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-500'
                                                    }`}
                                            >
                                                {bond.location.split(',')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Label */}
                            <div className="absolute bottom-8 left-10 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Live from Smart Oracles</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Detailed Metrics & Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Selector Info */}
                        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-black text-[10px] uppercase">{activeBond.category}</Badge>
                                <h2 className="text-2xl font-black text-neutral-900 leading-tight">{activeBond.title}</h2>
                                <p className="text-sm font-bold text-neutral-400">Impact Metrics Distribution</p>
                            </div>

                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#A3A3A3' }} width={100} />
                                        <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 shadow-2xl">
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{payload[0].name}</p>
                                                        <p className="text-lg font-black text-indigo-400">{payload[0].value}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="pt-4 border-t border-neutral-50 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] uppercase font-black text-neutral-400">ESG Verification</p>
                                    <p className="text-xs font-black text-emerald-600 uppercase">Verified on {new Date().toLocaleDateString()}</p>
                                </div>
                                <button className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                                    <HugeiconsIcon icon={Settings02Icon} size={18} className="text-neutral-500" />
                                </button>
                            </div>
                        </div>

                        {/* Additional Insight */}
                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white space-y-4 shadow-xl shadow-indigo-100 relative overflow-hidden group">
                            <div className="absolute -top-4 -right-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 transition-all group-hover:scale-150" />
                            <div className="relative z-10 space-y-4">
                                <HugeiconsIcon icon={Chart01Icon} size={32} />
                                <h3 className="text-xl font-black leading-tight uppercase tracking-tighter">Your Social Yield</h3>
                                <p className="text-indigo-100 text-sm font-bold leading-relaxed italic opacity-80">
                                    "Beyond the financial return, your investments represent tangible growth for local communities and a greener future."
                                </p>
                                <button className="pt-2 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                                    Download Impact Portfoio <HugeiconsIcon icon={Location01Icon} size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const Badge = ({ children, variant, className }: any) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-md ${className}`}>
        {children}
    </span>
);
