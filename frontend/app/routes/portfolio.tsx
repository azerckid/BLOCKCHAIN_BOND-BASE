import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import { PerformanceChart } from "@/components/portfolio/performance-chart";
import { InvestmentList } from "@/components/portfolio/investment-list";
import { StatItem } from "@/components/portfolio/stat-summary";
import {
    CoinsIcon,
    ChartBreakoutCircleIcon,
    Analytics01Icon
} from "@hugeicons/core-free-icons";

export default function PortfolioPage() {
    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Portfolio Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900">Your Portfolio</h1>
                    <p className="text-neutral-500 font-medium italic">Track your lending performance and asset distribution.</p>
                </div>

                {/* Stat Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatItem
                        title="Total Value Locked"
                        value="$25,650"
                        icon={CoinsIcon}
                        trend={{ value: 12.5, isUp: true }}
                        className="bg-neutral-900 text-white"
                    />
                    <StatItem
                        title="Cumulative Yield"
                        value="$479.55"
                        icon={ChartBreakoutCircleIcon}
                        vibrant
                    />
                    <StatItem
                        title="Avg. Portfolio APR"
                        value="13.4%"
                        icon={Analytics01Icon}
                        vibrant
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <PerformanceChart />
                    <AllocationChart />
                </div>

                {/* Detailed List */}
                <InvestmentList />
            </div>
        </DashboardLayout>
    );
}
