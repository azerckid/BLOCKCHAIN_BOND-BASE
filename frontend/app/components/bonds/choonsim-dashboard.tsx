import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Users,
    Globe,
    Award,
    ArrowUpRight,
    Zap,
    ShieldCheck,
    Clock,
    Search
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { cn } from "@/lib/utils";

export interface ChoonsimDashboardProps {
    project: {
        totalFollowers: number;
        totalSubscribers: number;
        southAmericaShare: number;
        japanShare: number;
        otherRegionShare: number;
        totalRevenue: number;
        currentApr: number;
        pendingYield: number;
        isAuditEnabled: boolean;
    };
    history: Array<{
        name: string;
        followers: number;
        revenue: number;
    }>;
    milestones: Array<{
        key: string;
        title: string;
        date: string;
        status: string;
    }>;
}

export function ChoonsimDashboard({ project, history, milestones }: ChoonsimDashboardProps) {
    const regionData = [
        { name: "South America", value: project.southAmericaShare, color: "#10b981" },
        { name: "Japan", value: project.japanShare, color: "#06b6d4" },
        { name: "Others", value: project.otherRegionShare, color: "#6366f1" },
    ];

    return (
        <div className="space-y-8 p-1 sm:p-4 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 text-[10px] font-black tracking-widest uppercase text-shadow-glow">
                            Exclusive RWA
                        </Badge>
                        <div className="flex items-center gap-1 text-emerald-500 animate-pulse">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Live Growth Tracking</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-none">
                        Choonsim <span className="text-emerald-500 italic">Growth</span>
                    </h1>
                    <p className="text-neutral-500 font-medium max-w-xl">
                        Invest in the global expansion of Chunsim AI-Talk. Earn yields from subscription revenue and milestone bonuses as the fandom scales in South America and Japan.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="rounded-xl border-neutral-200 font-bold h-12 px-6 hover:bg-neutral-50 group">
                        <Globe className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Region Report
                    </Button>
                    <Button className="rounded-xl bg-neutral-900 hover:bg-black text-white h-12 px-8 font-bold shadow-xl shadow-neutral-200 group">
                        <Zap className="mr-2 h-4 w-4 fill-emerald-500 text-emerald-500 group-hover:scale-125 transition-transform" />
                        Invest in Choonsim
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Followers", value: `${(project.totalFollowers / 1000).toFixed(1)}K`, change: "Real-time", icon: Users, color: "text-blue-500" },
                    { label: "Global Subscribers", value: project.totalSubscribers.toLocaleString(), change: "Active", icon: Heart, color: "text-pink-500" },
                    {
                        label: "Monthly Revenue",
                        value: `${(project.totalRevenue / 1000).toFixed(1)}K`,
                        unit: "USDC",
                        change: "+24%",
                        icon: TrendingUp,
                        color: "text-emerald-500",
                        footer: project.pendingYield > 0 ? (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 font-bold animate-pulse">
                                <Clock size={10} />
                                {project.pendingYield.toLocaleString()} USDC Pending Audit
                            </div>
                        ) : null
                    },
                    {
                        label: "Current APR",
                        value: `${project.currentApr}%`,
                        change: "Target",
                        icon: Award,
                        color: "text-amber-500",
                        footer: (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                                <ShieldCheck size={10} />
                                CC Oracle Verified
                            </div>
                        )
                    },
                ].map((stat, i) => (
                    <Card key={i} className="border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                        <CardContent className="p-6 relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-2 rounded-lg bg-neutral-50 group-hover:scale-110 transition-transform", stat.color)}>
                                    <stat.icon size={20} />
                                </div>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">
                                    {stat.change}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">
                                    {stat.value}
                                    {stat.unit && <span className="text-xs font-normal text-neutral-400 ml-1 italic">{stat.unit}</span>}
                                </h3>
                                {stat.footer}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <Card className="lg:col-span-2 border-neutral-100 shadow-xl shadow-neutral-100/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-50 px-8 py-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight">Growth Velocity</CardTitle>
                            <p className="text-xs text-neutral-400 font-medium italic">Fandom & Revenue Correlation (Weekly)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold border-neutral-200">
                                AUDIT MODE: {project.isAuditEnabled ? "STRICT" : "LEGACY"}
                            </Badge>
                            <Button variant="ghost" size="icon" className="rounded-full text-neutral-400">
                                <ArrowUpRight size={20} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 600, fill: '#A3A3A3' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 600, fill: '#A3A3A3' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="followers"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Regional Share & Milestones Column */}
                <div className="space-y-8">
                    {/* Audit Transparency Widget (New) */}
                    <Card className="border-emerald-100 bg-emerald-50/30 shadow-lg shadow-emerald-50/50">
                        <CardHeader className="px-6 py-4 border-b border-emerald-100">
                            <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2">
                                <Search className="text-emerald-600" size={16} />
                                Transparency Audit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-neutral-500 uppercase">Verification Source</span>
                                <Badge className="bg-blue-600 text-[10px]">CC Universal Oracle</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-neutral-500 uppercase">Audit Status</span>
                                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                                    <ShieldCheck size={14} />
                                    Active (Phase 2)
                                </span>
                            </div>
                            <Button className="w-full rounded-xl bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-[11px] font-bold h-10 shadow-sm">
                                View Proof on Explorer
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Share Pie Chart */}
                    <Card className="border-neutral-100 shadow-xl shadow-neutral-100/50">
                        <CardHeader className="px-6 py-4 border-b border-neutral-50">
                            <CardTitle className="text-lg font-black tracking-tight">Regional Impact</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[200px] w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={regionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {regionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {regionData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                            <span className="text-xs font-bold text-neutral-600">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-neutral-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestones Timeline */}
                    <Card className="border-neutral-100 shadow-xl shadow-neutral-100/50 overflow-hidden bg-neutral-900 text-white">
                        <CardHeader className="px-6 py-4 bg-white/5 border-b border-white/10">
                            <CardTitle className="text-lg font-black tracking-tight text-white flex items-center justify-between">
                                Roadmap
                                <Badge className="bg-emerald-500 text-white border-none animate-pulse">On Track</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:mt-1 before:h-full before:w-0.5 before:bg-white/10">
                                {milestones.map((m, i) => (
                                    <div key={i} className="relative flex items-start gap-4">
                                        <div className={cn(
                                            "mt-1.5 h-5 w-5 rounded-full border-4 border-neutral-900 z-10 transition-colors",
                                            m.status === "ACHIEVED" ? "bg-emerald-500" : "bg-neutral-700"
                                        )} />
                                        <div className="space-y-0.5">
                                            <p className={cn(
                                                "text-xs font-black uppercase tracking-widest",
                                                m.status === "ACHIEVED" ? "text-emerald-500" : "text-neutral-500"
                                            )}>
                                                {m.title}
                                            </p>
                                            <p className="text-[10px] font-bold text-neutral-500 italic uppercase">{m.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const Heart = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);
