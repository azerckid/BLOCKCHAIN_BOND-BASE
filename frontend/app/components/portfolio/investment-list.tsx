import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Clock01Icon
} from "@hugeicons/core-free-icons";

import * as React from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "@/config/contracts";
// We need to import the bond metadata to map IDs to Titles/APRs
// In a real app, this might come from an API or the contract metadata itself
import { MOCK_BONDS } from "@/routes/bonds";
import type { BondProps } from "@/components/bonds/bond-card";
import { toast } from "sonner";

// Component for individual row to handle its own hooks
function InvestmentRow({ inv, address }: { inv: any, address: `0x${string}` }) {
    // 1. Read Earned Yield
    const { data: earnedAmount, refetch: refetchEarned } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: "earned",
        args: [address, BigInt(inv.id)],
        query: {
            enabled: !!address,
            refetchInterval: 5000,
        }
    });

    const formattedYield = earnedAmount ? formatUnits(earnedAmount as bigint, 18) : "0";
    const hasYield = earnedAmount && (earnedAmount as bigint) > 0n;

    // 2. Read User Rewards State 
    const { data: userRewardState } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: "userRewards",
        args: [BigInt(inv.id), address],
    });

    // 3. Write Functions
    const { data: claimHash, isPending: isClaimPending, writeContract: writeClaimContract } = useWriteContract();
    const { writeContract: reinvestYield, data: reinvestHash, isPending: isReinvesting } = useWriteContract();

    // 4. Success Handlers
    const { isLoading: isConfirmingClaim, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });
    const { isSuccess: updateReinvestSuccess } = useWaitForTransactionReceipt({ hash: reinvestHash });

    React.useEffect(() => {
        if (isClaimSuccess) {
            toast.success("Yield claimed successfully!");
            refetchEarned();
        }
    }, [isClaimSuccess, refetchEarned]);

    React.useEffect(() => {
        if (updateReinvestSuccess) {
            toast.success("Yield reinvested into principal!");
            refetchEarned();
        }
    }, [updateReinvestSuccess, refetchEarned]);

    const handleClaim = () => {
        writeClaimContract({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: "claimYield",
            args: [BigInt(inv.id)],
        });
    };

    const handleReinvest = () => {
        reinvestYield({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: "reinvest",
            args: [BigInt(inv.id)],
        });
    };

    const totalInvested = inv.balance || 0n;
    const formattedTotalInvested = formatUnits(totalInvested, 18);

    return (
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:border-neutral-900/10 hover:shadow-lg transition-all">
            <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                    <HugeiconsIcon icon={Clock01Icon} size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-neutral-900">{inv.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                        <span>{Number(formattedTotalInvested).toLocaleString()} USDC Holdings</span>
                        <span>•</span>
                        <span>{inv.apr}% APR</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between xl:justify-end gap-6 md:gap-10">
                {/* Yield Information */}
                <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-black">Profit & Yield</p>
                    <div className="flex items-center gap-3 bg-neutral-50 p-2 rounded-xl border border-neutral-100 w-full group transition-all hover:bg-white hover:shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-neutral-400 uppercase leading-none">Accrued Profit</span>
                            <span className={`text-sm font-black transition-colors ${hasYield ? 'text-green-600' : 'text-neutral-400'}`}>
                                {hasYield ? `$${(Number(formattedYield)).toFixed(6)}` : "$0.000000"}
                            </span>
                        </div>
                        {hasYield && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 px-3 text-[10px] font-black bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200"
                                disabled={isClaimPending || isConfirmingClaim}
                                onClick={handleClaim}
                            >
                                {isClaimPending || isConfirmingClaim ? "..." : "CLAIM"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status & Options */}
                <div className="flex flex-col items-end gap-1.5 min-w-[150px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-black px-1">Engine Status</p>
                    <div className="flex gap-2">
                        {hasYield && (
                            <Button
                                size="sm"
                                onClick={handleReinvest}
                                disabled={isReinvesting}
                                className="h-8 px-3 text-[10px] font-black bg-neutral-900 text-white rounded-xl shadow-lg shadow-neutral-200 hover:scale-105 transition-transform"
                            >
                                {isReinvesting ? "..." : "REINVEST"}
                            </Button>
                        )}
                        <div className="flex flex-col items-end justify-center px-1">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-black text-[9px] py-1 rounded-md">
                                HOLDING ACTIVE
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Term</p>
                <p className="text-sm font-bold text-neutral-900">{inv.term}</p>
            </div>
        </div>
    );
}

export function InvestmentList() {
    const { address } = useAccount();

    const bondIds = MOCK_BONDS.map((b: BondProps) => BigInt(b.id));
    const accounts = MOCK_BONDS.map(() => address as `0x${string}`);

    const { data: balances, isLoading } = useReadContract({
        address: CONTRACTS.BondToken.address as `0x${string}`,
        abi: CONTRACTS.BondToken.abi,
        functionName: "balanceOfBatch",
        args: address ? [accounts, bondIds] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 5000,
        }
    });

    const myInvestments = MOCK_BONDS.map((bond: BondProps, index: number) => {
        const currentBalances = balances as readonly bigint[] | undefined;
        const walletBalance = currentBalances ? currentBalances[index] : 0n;
        return {
            ...bond,
            balance: walletBalance,
            formattedBalance: walletBalance ? formatUnits(walletBalance, 18) : "0",
        };
    }).filter((inv) => inv.balance > 0n);

    if (isLoading) {
        return <div className="p-8 text-center text-neutral-400 animate-pulse">Loading investments...</div>;
    }

    if (!address) {
        return <div className="p-8 text-center text-neutral-400">Please connect your wallet to view investments.</div>;
    }

    if (myInvestments.length === 0) {
        return (
            <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                <p className="text-neutral-900 font-bold mb-1">No active investments</p>
                <p className="text-sm text-neutral-500">Visit the Bond Market to start earning yield.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">My Investments</h3>
            <div className="grid gap-4">
                {myInvestments.map((inv) => (
                    <InvestmentRow key={inv.id} inv={inv} address={address as `0x${string}`} />
                ))}
            </div>
        </div>
    );
}
