import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatSummary, StatItem } from "@/components/portfolio/stat-summary";
import { BondCard, type BondProps } from "@/components/bonds/bond-card";

import {
    Coins01Icon,
    Globe02Icon,
    Analytics01Icon,
    Certificate01Icon
} from "@hugeicons/core-free-icons";

export function meta() {
    return [
        { title: "Dashboard | BuildCTC - RWA Yield Protocol" },
        { name: "description", content: "Manage your RWA investments and portfolio" },
    ];
}

const MOCK_BONDS: BondProps[] = [
    {
        id: "1",
        title: "SME Working Capital - Bangkok",
        description: "Supporting local retail businesses in the heart of Thailand.",
        apr: 12.5,
        term: "12 Months",
        location: "Bangkok, Thailand",
        totalAmount: "$5.0M",
        remainingAmount: "$1.2M",
        status: "active",
        category: "Real Estate",
    },
    {
        id: "2",
        title: "Agriculture Supply Chain",
        description: "Post-harvest financing for rice farmers in Northern provinces.",
        apr: 14.2,
        term: "6 Months",
        location: "Chiang Mai, Thailand",
        totalAmount: "$2.0M",
        remainingAmount: "$0.4M",
        status: "active",
        category: "Agriculture",
    },
    {
        id: "3",
        title: "Clean Energy Infrastructure",
        description: "Solar panel installation for suburban community centers.",
        apr: 11.8,
        term: "24 Months",
        location: "Phuket, Thailand",
        totalAmount: "$8.5M",
        remainingAmount: "$3.1M",
        status: "active",
        category: "Energy",
    }
];

export default function Home() {
    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Hero Section */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900">
                        Welcome back, Alex
                    </h1>
                    <p className="text-neutral-500 font-medium">
                        Your real-world asset portfolio is performing steadily.
                    </p>
                </div>

                {/* Dashboard Stats */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                            Key Metrics
                        </h2>
                    </div>
                    <StatSummary>
                        <StatItem
                            title="Total Portfolio Value"
                            value="$124,500"
                            trend={{ value: "12.5%", isUp: true }}
                            icon={Coins01Icon}
                            vibrant
                        />
                        <StatItem
                            title="Average Yield (APR)"
                            value="13.2%"
                            icon={Analytics01Icon}
                            description="Weighted across all assets"
                        />
                        <StatItem
                            title="Unclaimed Yield"
                            value="$1,245.80"
                            icon={Certificate01Icon}
                            trend={{ value: "$142.0", isUp: true }}
                        />
                        <StatItem
                            title="TVL in Protocol"
                            value="$42.5M"
                            icon={Globe02Icon}
                            description="+2.4M since last week"
                        />
                    </StatSummary>
                </section>

                {/* Featured Bonds */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                Investment Opportunities
                            </h2>
                        </div>
                        <button className="text-sm font-bold text-neutral-900 hover:underline transition-all">
                            View All Markets
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {MOCK_BONDS.map((bond) => (
                            <BondCard key={bond.id} bond={bond} />
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
