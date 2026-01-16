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

    // 2. Read Staked Balance
    const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: "stakingBalances",
        args: [address],
        query: { enabled: isYieldSupported && !!address, refetchInterval: 5000 }
    });

    // 3. Check Approval for Staking
    const { data: isApproved, refetch: refetchApproval } = useReadContract({
        address: CONTRACTS.BondToken.address as `0x${string}`,
        abi: CONTRACTS.BondToken.abi,
        functionName: "isApprovedForAll",
        args: address ? [address, CONTRACTS.YieldDistributor.address as `0x${string}`] : undefined,
        query: { enabled: isYieldSupported && !!address }
    });

    // 4. Write Claim Yield
    const { data: claimHash, isPending: isClaimPending, writeContract: writeClaimContract } = useWriteContract();

    // 5. Staking/Withdraw Logic
    const { writeContract: stakeBond, data: stakeHash, isPending: isStaking } = useWriteContract();
    const { writeContract: withdrawBond, data: withdrawHash, isPending: isWithdrawing } = useWriteContract();
    const { writeContract: setApproval, data: approveHash, isPending: isApproving } = useWriteContract();

    // 6. Success Handlers
    const { isLoading: isConfirmingClaim, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });
    const { isSuccess: updateStakeSuccess } = useWaitForTransactionReceipt({ hash: stakeHash });
    const { isSuccess: updateWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });
    const { isSuccess: updateApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    React.useEffect(() => {
        if (isClaimSuccess) {
            toast.success("Yield claimed successfully!");
            refetchEarned();
        }
    }, [isClaimSuccess, refetchEarned]);

    React.useEffect(() => {
        if (updateApproveSuccess) {
            toast.success("Access approved! Now starting to stake your assets...");
            // Automatically trigger stake after approval success
            stakeBond({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: "stake",
                args: [inv.balance],
            });
            refetchApproval();
        }
        if (updateStakeSuccess || updateWithdrawSuccess) {
            toast.success("Assets moved to Yield Engine!");
            refetchEarned();
            refetchStaked();
        }
    }, [updateStakeSuccess, updateWithdrawSuccess, updateApproveSuccess, refetchEarned, refetchStaked, refetchApproval, inv.balance, stakeBond]);

    const handleClaim = () => {
        if (!isYieldSupported) return;
        writeClaimContract({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: "claimYield",
        });
    };

    const handleStake = () => {
        if (!isYieldSupported) return;
        if (!isApproved) {
            setApproval({
                address: CONTRACTS.BondToken.address as `0x${string}`,
                abi: CONTRACTS.BondToken.abi,
                functionName: "setApprovalForAll",
                args: [CONTRACTS.YieldDistributor.address as `0x${string}`, true],
            });
            return;
        }
        stakeBond({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: "stake",
            args: [inv.balance], // Stake the balance currently in the wallet
        });
    };

    const handleWithdraw = () => {
        if (!isYieldSupported) return;
        withdrawBond({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: "withdraw",
            args: [stakedBalance as bigint], // Withdraw the entire staked amount
        });
    };

    const totalInvested = (inv.balance || 0n) + (stakedBalance as bigint || 0n);
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
                {/* Yield Engine Information */}
                <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Yield Engine</p>
                    {isYieldSupported ? (
                        <div className="flex items-center gap-3 bg-neutral-50 p-2 rounded-xl border border-neutral-100 w-full">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-neutral-400 uppercase leading-none">Accrued</span>
                                <span className={`text-sm font-black ${hasYield ? 'text-green-600' : 'text-neutral-400'}`}>
                                    {hasYield ? `$${Number(formattedYield).toFixed(4)}` : "$0.0000"}
                                </span>
                            </div>
                            {hasYield ? (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 px-3 text-[10px] font-black bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200"
                                    disabled={isClaimPending || isConfirmingClaim}
                                    onClick={handleClaim}
                                >
                                    {isClaimPending || isConfirmingClaim ? "..." : "CLAIM"}
                                </Button>
                            ) : (
                                <div className="text-[9px] font-bold text-neutral-400 leading-tight border-l border-neutral-200 pl-2">
                                    {(stakedBalance as bigint > 0n) ? "STAKED & EARNING" : "NOT STAKED"} <br />
                                    <span className="text-[8px] opacity-70">{(stakedBalance as bigint > 0n) ? "WAITING FOR ADMIN" : "STAKE TO START"}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs font-bold text-neutral-400">Not Integrated</p>
                    )}
                </div>

                {/* Staking Controls */}
                <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-1">Staking Status</p>
                    {isYieldSupported ? (
                        <div className="flex gap-1.5">
                            {(inv.balance > 0n) && (
                                <Button
                                    size="sm"
                                    onClick={handleStake}
                                    disabled={isStaking || isApproving}
                                    className="h-8 px-3 text-[10px] font-black bg-neutral-900 text-white"
                                >
                                    {isApproving ? "APPROVING..." : isStaking ? "STAKING..." : !isApproved ? "APPROVE & STAKE" : "STAKE"}
                                </Button>
                            )}
                            {(stakedBalance as bigint > 0n) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleWithdraw}
                                    disabled={isWithdrawing}
                                    className="h-8 px-3 text-[10px] font-black border-neutral-200"
                                >
                                    {isWithdrawing ? "..." : "UNSTAKE"}
                                </Button>
                            )}
                            {(!inv.balance && !stakedBalance) && (
                                <span className="text-xs font-bold text-neutral-300 italic px-2">No assets</span>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs font-bold text-neutral-300 italic px-2">N/A</p>
                    )}
                </div>

                <div className="text-right hidden md:block">
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
        const currentBalances = balances as readonly bigint[] | undefined;
        const walletBalance = currentBalances ? currentBalances[index] : 0n;
        // In this prototype, we'll need to manually fetch staked balance for the row
        // but for total TVL we show the sum
        return {
            ...bond,
            balance: walletBalance, // This is what's in the wallet
            formattedBalance: walletBalance ? formatUnits(walletBalance, 18) : "0",
        };
    }).filter((inv) => inv.balance > 0n || inv.id === "1"); // Keep ID 1 visible for staking check

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
