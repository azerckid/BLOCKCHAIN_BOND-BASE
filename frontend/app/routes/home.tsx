import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatSummary, StatItem } from "@/components/portfolio/stat-summary";
import { BondCard, type BondProps } from "@/components/bonds/bond-card";

import {
    Coins01Icon,
    Globe02Icon,
    Analytics01Icon,
    UserGroupIcon,
    ArrowUp01Icon,
    ChampionIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLoaderData } from "react-router";
import { db } from "@/db";
import { choonsimProjects, choonsimRevenue, choonsimMilestones } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function meta() {
    return [
        { title: "Dashboard | BondBase - RWA Yield Protocol" },
        { name: "description", content: "Manage your RWA investments and portfolio" },
    ];
}

export async function loader() {
    let project = await db.query.choonsimProjects.findFirst({
        where: eq(choonsimProjects.id, "choonsim-main"),
    });

    if (!project) {
        // Initialize if not exists
        await db.insert(choonsimProjects).values({
            id: "choonsim-main",
            name: "Chunsim AI-Talk",
            totalFollowers: 32000,
            totalSubscribers: 1240,
            updatedAt: new Date().getTime(),
        });
        project = await db.query.choonsimProjects.findFirst({
            where: eq(choonsimProjects.id, "choonsim-main"),
        });
    }

    const recentRevenue = await db.query.choonsimRevenue.findMany({
        where: eq(choonsimRevenue.projectId, "choonsim-main"),
        orderBy: [desc(choonsimRevenue.receivedAt)],
        limit: 5,
    });

    const milestones = await db.query.choonsimMilestones.findMany({
        where: eq(choonsimMilestones.projectId, "choonsim-main"),
        orderBy: [desc(choonsimMilestones.achievedAt)],
    });

    return { project, recentRevenue, milestones };
}

// Bond data imported from market for consistency
import { CHOONSIM_BOND_DATA } from "./bonds";

export default function Home() {
    const { project, recentRevenue, milestones } = useLoaderData<typeof loader>();

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-600 text-white rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Choonsim Official</Badge>
                            <span className="text-xs font-bold text-neutral-400">Phase 3: IP Growth</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-neutral-900 italic">
                            Growing with <span className="text-emerald-600">Choonsim</span>
                        </h1>
                        <p className="text-neutral-500 font-medium max-w-md">
                            Join the global expansion of Chunsim AI-Talk. Turn IP fandom growth into your real-world assets.
                        </p>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <section className="space-y-4">
                    <StatSummary>
                        <StatItem
                            title="Choonsim Followers"
                            value={project?.totalFollowers?.toLocaleString() || "65,200"}
                            trend={{ value: "Global", isUp: true }}
                            icon={UserGroupIcon}
                            vibrant
                        />
                        <StatItem
                            title="Active Subscribers"
                            value={project?.totalSubscribers?.toLocaleString() || "1,541"}
                            icon={Analytics01Icon}
                            description="AI-Talk monthly users"
                        />
                        <StatItem
                            title="IP Yield (APR)"
                            value="18.5%"
                            icon={Coins01Icon}
                            trend={{ value: "Targeted", isUp: true }}
                        />
                        <StatItem
                            title="Fandom Reach"
                            value="Global"
                            icon={Globe02Icon}
                            description="S.America & Japan"
                        />
                    </StatSummary>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Primary Investment */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                Primary Alpha Opportunity
                            </h2>
                        </div>
                        <BondCard bond={CHOONSIM_BOND_DATA} />
                    </div>

                    {/* Milestones & Revenue */}
                    <div className="space-y-8">
                        {/* Milestones */}
                        <section className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">Recent Milestones</h2>
                            <div className="space-y-4 bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
                                {milestones.length > 0 ? milestones.map(m => (
                                    <div key={m.id} className="flex gap-4 items-start">
                                        <div className="bg-white p-2 rounded-xl shadow-sm border border-neutral-100">
                                            <HugeiconsIcon icon={ChampionIcon} size={20} className="text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-900">{m.description}</p>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase">{new Date(m.achievedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-neutral-500 italic">No milestones achieved yet.</p>
                                )}
                            </div>
                        </section>

                        {/* Recent Revenue */}
                        <section className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">Revenue Stream</h2>
                            <div className="space-y-3">
                                {recentRevenue.map(r => (
                                    <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-50 p-2 rounded-lg">
                                                <HugeiconsIcon icon={ArrowUp01Icon} size={16} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-neutral-900">{r.source}</p>
                                                <p className="text-[10px] text-neutral-400">{new Date(r.receivedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-neutral-900">+${(r.amount / 100).toFixed(2)}</p>
                                    </div>
                                ))}
                                <div className="p-4 bg-neutral-900 text-white rounded-2xl flex justify-between items-center">
                                    <p className="text-xs font-bold">Total IP Revenue</p>
                                    <p className="text-sm font-black">$45,200.00</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
