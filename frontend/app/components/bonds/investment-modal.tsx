import * as React from "react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CoinsIcon,
    Analytics01Icon,
    Calendar01Icon,
    InformationCircleIcon,
    Loading03Icon
} from "@hugeicons/core-free-icons";
import { type BondProps } from "./bond-card";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { toast } from "sonner";

interface InvestmentModalProps {
    bond: BondProps;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvest: (amount: number) => void;
}

export function InvestmentModal({ bond, open, onOpenChange, onInvest }: InvestmentModalProps) {
    const [amount, setAmount] = React.useState<string>("");
    const { address, isConnected } = useAccount();

    // Wagmi Hooks for Writing
    const { writeContract: writeApprove, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
    const { writeContract: writePurchase, data: purchaseHash, isPending: isPurchasing, error: purchaseError } = useWriteContract();

    // Transaction Receipts
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({ hash: purchaseHash });

    const numericAmount = parseFloat(amount) || 0;
    const estimatedYield = (numericAmount * bond.apr) / 100;

    // Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: address ? [address, CONTRACTS.LiquidityPool.address as `0x${string}`] : undefined,
        query: { enabled: !!address && open },
    });

    const parsedAmount = React.useMemo(() => {
        try {
            return parseUnits(amount, 18);
        } catch {
            return 0n;
        }
    }, [amount]);

    const isAllowanceSufficient = allowance ? allowance >= parsedAmount : false;

    // Effect: Handle Approve Success
    React.useEffect(() => {
        if (isApproveSuccess) {
            toast.success("USDC Approved successfully!");
            refetchAllowance();
        }
    }, [isApproveSuccess, refetchAllowance]);

    // Effect: Handle Purchase Success
    React.useEffect(() => {
        if (isPurchaseSuccess) {
            toast.success("Investment successful!", {
                description: `You have successfully invested ${amount} USDC in ${bond.title}.`,
            });
            onInvest(numericAmount); // Call parent handler
            onOpenChange(false);
            setAmount("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPurchaseSuccess]);

    // Effects: Handle Errors
    React.useEffect(() => {
        if (approveError) toast.error(`Approval failed: ${approveError.message}`);
        if (purchaseError) toast.error(`Investment failed: ${purchaseError.message}`);
    }, [approveError, purchaseError]);

    const handleAction = () => {
        if (!address) {
            toast.error("Please connect your wallet first.");
            return;
        }
        if (numericAmount <= 0) return;

        if (!isAllowanceSufficient) {
            // Step 1: Approve
            writeApprove({
                address: CONTRACTS.MockUSDC.address as `0x${string}`,
                abi: erc20Abi,
                functionName: "approve",
                args: [CONTRACTS.LiquidityPool.address as `0x${string}`, parsedAmount],
            });
        } else {
            // Step 2: Unsafe/Standard Check for Bond ID
            // Since bonds are strings "1", "2"..., parse them.
            // If bond.id is not a number string, this might fail. Assume DB ids match Contract IDs.
            const bondIdBigInt = BigInt(bond.id);

            writePurchase({
                address: CONTRACTS.LiquidityPool.address as `0x${string}`,
                abi: CONTRACTS.LiquidityPool.abi,
                functionName: "purchaseBond",
                args: [bondIdBigInt, parsedAmount],
            });
        }
    };

    const isProcessing = isApproving || isApproveConfirming || isPurchasing || isPurchaseConfirming;

    let buttonText = "Confirm Investment";
    if (isApproving || isApproveConfirming) buttonText = "Approving USDC...";
    else if (!isAllowanceSufficient) buttonText = "Approve USDC";
    else if (isPurchasing || isPurchaseConfirming) buttonText = "Purchasing Bond...";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-neutral-900 p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                            {bond.category}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-green-400">
                            <HugeiconsIcon icon={Analytics01Icon} size={16} />
                            <span className="text-sm font-bold">{bond.apr}% APR</span>
                        </div>
                    </div>
                    <AlertDialogTitle className="text-2xl font-black tracking-tight leading-tight mb-2">
                        Invest in {bond.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-400 text-sm italic">
                        {bond.description}
                    </AlertDialogDescription>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-2 gap-4 py-4 px-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Term</p>
                            <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                                <HugeiconsIcon icon={Calendar01Icon} size={16} />
                                {bond.term}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Remaining</p>
                            <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                                <HugeiconsIcon icon={CoinsIcon} size={16} />
                                {bond.remainingAmount}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                Investment Amount (USDC)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    className="h-14 text-lg font-bold rounded-xl border-neutral-200 focus:ring-neutral-900 pl-4 pr-16"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={isProcessing}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                                    USDC
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                                    <HugeiconsIcon icon={InformationCircleIcon} size={14} />
                                    Estimated Annual Yield
                                </span>
                                <span className="text-sm font-black text-blue-700">
                                    + ${estimatedYield.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <p className="text-[10px] text-blue-500 italic">
                                * Calculated based on {bond.apr}% APR. Actual returns may vary.
                            </p>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="p-4 bg-neutral-50 border-t border-neutral-100 gap-3">
                    <AlertDialogCancel
                        className="rounded-xl font-bold h-12 flex-1 hover:bg-white transition-all"
                        disabled={isProcessing}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            handleAction();
                        }}
                        disabled={numericAmount <= 0 || isProcessing || !isConnected}
                        className="rounded-xl font-bold h-12 flex-1 bg-neutral-900 hover:bg-black text-white hover:shadow-lg transition-all disabled:opacity-50 gap-2"
                    >
                        {isProcessing && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={18} />}
                        {isPurchaseSuccess ? "Unbelievable Success!" : buttonText}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
