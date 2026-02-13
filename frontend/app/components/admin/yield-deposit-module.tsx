import * as React from "react";
import { useWriteContract, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { CONTRACTS, type BondInfo } from "@/config/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    MoneyReceiveFlowIcon,
    Tick01Icon,
    Loading03Icon,
    Alert01Icon,
    Wallet02Icon
} from "@hugeicons/core-free-icons";

import { MOCK_BONDS } from "@/routes/bonds";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useContractTransaction } from "@/hooks/use-contract-transaction";

export function YieldDepositModule() {
    const [amount, setAmount] = React.useState("");
    const [bondId, setBondId] = React.useState("1");

    const amountInWei = React.useMemo(() => {
        try {
            return parseUnits(amount, 18);
        } catch {
            return BigInt(0);
        }
    }, [amount]);

    // Module-specific read: bond info for total holdings
    const { data: bondInfo } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: "bonds",
        args: [BigInt(bondId)],
    });

    const totalHoldings = bondInfo ? (bondInfo as unknown as BondInfo).totalHoldings : undefined;

    const {
        step,
        isProcessing,
        isWaitingForTx,
        needsApprove,
        insufficientBalance,
        allowance,
        usdcBalance,
        handleApprove,
        executeAction,
        reset,
    } = useContractTransaction({
        spenderAddress: CONTRACTS.YieldDistributor.address as `0x${string}`,
        approvalAmount: amountInWei,
        onSuccess: () => setAmount(""),
    });

    // Module-specific action
    const { writeContractAsync: deposit } = useWriteContract();

    const handleDeposit = React.useCallback(async () => {
        await executeAction(async () => {
            return await deposit({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: "depositYield",
                args: [BigInt(bondId), amountInWei],
            });
        });
    }, [executeAction, deposit, bondId, amountInWei]);

    const handleReset = React.useCallback(() => {
        setAmount("");
        reset();
    }, [reset]);

    const isAmountZero = !amount || parseUnits(amount, 18) === BigInt(0);
    const noTokensStaked = totalHoldings !== undefined && totalHoldings === BigInt(0);

    return (
        <Card className="border-neutral-200 shadow-xl shadow-neutral-100 overflow-hidden rounded-3xl">
            <CardHeader className="bg-neutral-900 text-white p-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <HugeiconsIcon icon={MoneyReceiveFlowIcon} size={32} />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Yield Distribution Portal</CardTitle>
                        <CardDescription className="text-neutral-400 font-medium">
                            Inject capital into the yield engine.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
                {/* Bond Selection */}
                <div className="space-y-4">
                    <Label className="text-sm font-black text-neutral-900 uppercase tracking-widest">Target Bond</Label>
                    <Select value={bondId} onValueChange={(val) => val && setBondId(val)} disabled={isProcessing}>
                        <SelectTrigger className="w-full h-12 rounded-xl bg-neutral-50 border-neutral-200 font-bold">
                            <SelectValue placeholder="Select a bond" />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_BONDS.map((bond) => (
                                <SelectItem key={bond.id} value={bond.id} className="font-medium">
                                    <span className="font-bold mr-2">#{bond.id}</span> {bond.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Balance Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Your USDC Balance</p>
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={Wallet02Icon} size={16} className="text-neutral-500" />
                            <span className="text-lg font-black text-neutral-900">
                                {usdcBalance ? Number(formatUnits(usdcBalance, 18)).toLocaleString() : "0.00"}
                            </span>
                        </div>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Current Allowance</p>
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={Tick01Icon} size={16} className="text-neutral-500" />
                            <span className="text-lg font-black text-neutral-900 truncate">
                                {allowance ? Number(formatUnits(allowance, 18)).toLocaleString() : "0.00"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                        Distribution Amount
                        <span className="text-neutral-300 text-xs font-medium lowercase italic">(USDC)</span>
                    </label>

                    <div className="relative group">
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-3xl font-black h-20 pl-14 border-2 border-neutral-200 focus:border-neutral-900 focus:ring-0 transition-all rounded-2xl shadow-inner bg-neutral-50/50"
                            placeholder="0.00"
                            disabled={isProcessing}
                        />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                            <span className="text-2xl font-black">$</span>
                        </div>
                    </div>
                    {insufficientBalance && (
                        <p className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                            <HugeiconsIcon icon={Alert01Icon} size={14} />
                            Insufficient USDC balance in your wallet.
                        </p>
                    )}
                </div>

                {/* Progress Visual */}
                {(isProcessing || isWaitingForTx || step === "success") && (
                    <div className="space-y-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-200 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-neutral-900 tracking-tight">
                                {step === "approving" && (isWaitingForTx ? "Waiting for Confirmation..." : "Step 1: Approving Access")}
                                {step === "executing" && (isWaitingForTx ? "Broadcasting to Network..." : "Step 2: Distributing Yield")}
                                {step === "success" && "Yield Successfully Distributed!"}
                            </span>
                            {(isProcessing || isWaitingForTx) && (
                                <HugeiconsIcon icon={Loading03Icon} className="animate-spin text-neutral-900" size={20} />
                            )}
                            {step === "success" && (
                                <div className="p-1 bg-green-500 text-white rounded-full">
                                    <HugeiconsIcon icon={Tick01Icon} size={14} />
                                </div>
                            )}
                        </div>
                        <Progress
                            value={step === "approving" ? 50 : step === "executing" ? 90 : step === "success" ? 100 : 0}
                            className="h-3 bg-neutral-200 overflow-hidden rounded-full [&>div]:bg-neutral-900"
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                {step === "success" ? (
                    <div className="w-full py-6 bg-green-50 border border-green-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in zoom-in duration-500">
                        <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-200">
                            <HugeiconsIcon icon={Tick01Icon} size={24} />
                        </div>
                        <h4 className="text-lg font-black text-green-900">Distribution Complete!</h4>
                        <p className="text-xs font-bold text-green-700">Yield has been successfully injected into the contract.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="mt-4 border-green-200 text-green-700 hover:bg-green-100 rounded-xl font-bold"
                        >
                            New Distribution
                        </Button>
                    </div>
                ) : (
                    <>
                        {needsApprove ? (
                            <Button
                                onClick={handleApprove}
                                disabled={isProcessing || isWaitingForTx || insufficientBalance || isAmountZero}
                                className="w-full h-16 text-xl font-black rounded-2xl bg-neutral-900 hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200"
                            >
                                {isProcessing ? "Processing..." : isAmountZero ? "Enter Amount" : "Step 1: Approve USDC"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleDeposit}
                                disabled={isProcessing || isWaitingForTx || insufficientBalance || isAmountZero || noTokensStaked}
                                className="w-full h-16 text-xl font-black rounded-2xl bg-neutral-900 hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200"
                            >
                                {isProcessing ? "Processing..." : isAmountZero ? "Enter Amount" : noTokensStaked ? "No Stakers Found" : "Step 2: Deposit Yield"}
                            </Button>
                        )}

                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <div className="text-sm font-medium text-neutral-500 mb-1">Total Base Holdings</div>
                            <div className="text-2xl font-bold text-neutral-900 tracking-tight">
                                {totalHoldings !== undefined ? formatUnits(totalHoldings, 18) : "0"} <span className="text-sm font-medium text-neutral-400">CTC</span>
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-1">Found in active wallets</div>
                        </div>

                        <div className={`flex gap-3 p-4 rounded-2xl border transition-colors ${noTokensStaked ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                            <HugeiconsIcon icon={Alert01Icon} size={20} className={noTokensStaked ? "text-red-600 shrink-0 mt-0.5" : "text-amber-600 shrink-0 mt-0.5"} />
                            <div className="space-y-1">
                                {noTokensStaked && (
                                    <p className="text-[11px] font-black text-red-800 uppercase tracking-tight">
                                        Critcal: No users are holding these bonds yet.
                                    </p>
                                )}
                                <p className={`text-[11px] font-bold leading-normal ${noTokensStaked ? 'text-red-700' : 'text-amber-800'}`}>
                                    {noTokensStaked
                                        ? "You cannot deposit yield when there are no holders. Please wait for users to purchase bonds first."
                                        : "This action will immediately update the yield index for all bondholders. Once confirmed, funds are transferred from your wallet to the contract."}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
