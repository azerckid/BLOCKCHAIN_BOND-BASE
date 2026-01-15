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
    // Check if this bond supports yield distribution (Currently only ID 1)
    const isYieldSupported = inv.id === "1";

    // 1. Read Earned Yield
    const { data: earnedAmount, refetch: refetchEarned } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: "earned",
        args: [address],
        query: {
            enabled: isYieldSupported && !!address,
            refetchInterval: 5000,
        }
    });

    const formattedYield = earnedAmount ? formatUnits(earnedAmount as bigint, 18) : "0";
    const hasYield = earnedAmount && (earnedAmount as bigint) > 0n;

    // 2. Write Claim Yield
    const { data: hash, isPending: isClaimPending, writeContract } = useWriteContract();

    // 3. Wait for Transaction
    const { isLoading: isConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Handle successful claim
    React.useEffect(() => {
        if (isClaimSuccess) {
            toast.success("Yield claimed successfully!");
            refetchEarned();
        }
    }, [isClaimSuccess, refetchEarned]);

    const handleClaim = () => {
        if (!isYieldSupported) return;
        writeContract({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: "claimYield",
        });
    };

    return (
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:border-neutral-900/10 hover:shadow-lg transition-all">
            <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                    <HugeiconsIcon icon={Clock01Icon} size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-neutral-900">{inv.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                        <span>{Number(inv.formattedBalance).toLocaleString()} USDC invested</span>
                        <span>•</span>
                        <span>{inv.apr}% APR</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between xl:justify-end gap-6 md:gap-10">
                <div className="text-right flex flex-col items-end">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Unclaimed Yield</p>
                    {isYieldSupported ? (
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-neutral-900 text-green-600">
                                ${Number(formattedYield).toFixed(4)}
                            </p>
                            <Button
                                size="sm"
                                className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                                disabled={!hasYield || isClaimPending || isConfirming}
                                onClick={handleClaim}
                            >
                                {isClaimPending || isConfirming ? "Claiming..." : "Claim"}
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm font-medium text-neutral-400">Not Integrated</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Term</p>
                    <p className="text-sm font-bold text-neutral-900">{inv.term}</p>
                </div>
                <div className="hidden sm:block">
                    <Badge className="bg-green-500 hover:bg-green-600 border-none">
                        Active
                    </Badge>
                </div>
            </div>
        </div>
    );
}

export function InvestmentList() {
    const { address } = useAccount();

    // Prepare arrays for batch call
    // MOCK_BONDS ids are "1", "2"... convert to BigInt for contract call
    const bondIds = MOCK_BONDS.map((b: BondProps) => BigInt(b.id));
    const accounts = MOCK_BONDS.map(() => address as `0x${string}`);

    // Fetch balances for all bonds at once
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

    // Valid investments filter
    const myInvestments = MOCK_BONDS.map((bond: BondProps, index: number) => {
        // Explicitly cast balances to avoid TS error "Element implicitly has an any type..."
        const currentBalances = balances as readonly bigint[] | undefined;
        const balance = currentBalances ? currentBalances[index] : 0n;
        return {
            ...bond,
            balance, // BigInt
            formattedBalance: balance ? formatUnits(balance, 18) : "0",
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
