import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import { PerformanceChart } from "@/components/portfolio/performance-chart";
import { InvestmentList } from "@/components/portfolio/investment-list";
import { StatItem } from "@/components/portfolio/stat-summary";
import {
    Coins01Icon,
    ChartBreakoutCircleIcon,
    Analytics01Icon
} from "@hugeicons/core-free-icons";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { MOCK_BONDS } from "@/routes/bonds";
import type { BondProps } from "@/components/bonds/bond-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loading03Icon, Tick01Icon } from "@hugeicons/core-free-icons";

export default function PortfolioPage() {
    const { address } = useAccount();

    const bondIds = MOCK_BONDS.map((b: BondProps) => BigInt(b.id));
    const accounts = MOCK_BONDS.map(() => address as `0x${string}`);

    const { data: balances } = useReadContract({
        address: CONTRACTS.BondToken.address as `0x${string}`,
        abi: CONTRACTS.BondToken.abi,
        functionName: "balanceOfBatch",
        args: address ? [accounts, bondIds] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    // Fetch earned yield
    const { data: earnedYield, refetch: refetchEarned } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: "earned",
        args: address ? [address] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    // Claim Logic
    const { writeContract: claimYield, data: claimHash, isPending: isClaiming } = useWriteContract();
    const { isLoading: isWaitingForClaim, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    React.useEffect(() => {
        if (isClaimSuccess) {
            toast.success("Yield claimed successfully!");
            refetchEarned();
        }
    }, [isClaimSuccess]);

    const handleClaim = () => {
        if (!address) return;
        claimYield({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: "claimYield",
        });
    };

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const totalValueLocked = React.useMemo(() => {
        if (!balances) return 0;
        const currentBalances = balances as readonly bigint[];
        return currentBalances.reduce((acc, balance) => {
            return acc + Number(formatUnits(balance, 18));
        }, 0);
    }, [balances]);

    if (!isMounted) return null;

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
                        value={totalValueLocked > 0 ? `$${totalValueLocked.toLocaleString()}` : "$0"}
                        icon={Coins01Icon}
                        trend={totalValueLocked > 0 ? { value: 12.5, isUp: true } : undefined}
                        vibrant
                    />
                    <div className="relative group">
                        <StatItem
                            title="Cumulative Yield"
                            value={earnedYield ? `$${Number(formatUnits(earnedYield as bigint, 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : "$0.00"}
                            icon={ChartBreakoutCircleIcon}
                            description="Live accrued interest from Bond ID #1"
                            vibrant
                        />
                        {!!earnedYield && (earnedYield as bigint) > 0n && (
                            <div className="absolute top-4 right-4">
                                <Button
                                    onClick={handleClaim}
                                    disabled={isClaiming || isWaitingForClaim}
                                    className="bg-green-500 hover:bg-green-600 text-white font-black text-[10px] h-7 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-green-900/20 border border-green-400/30"
                                >
                                    {(isClaiming || isWaitingForClaim) ? (
                                        <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={12} />
                                    ) : (
                                        <HugeiconsIcon icon={Tick01Icon} size={12} />
                                    )}
                                    CLAIM
                                </Button>
                            </div>
                        )}
                    </div>
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
