import * as React from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Database01Icon,
    Tick01Icon,
    Loading03Icon,
    Alert01Icon,
    AiCloudIcon,
    Wallet02Icon,
    ZapIcon
} from "@hugeicons/core-free-icons";

import { MOCK_BONDS } from "@/routes/bonds";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function OracleTriggerModule() {
    const { address } = useAccount();
    const [amount, setAmount] = React.useState("");
    const [bondId, setBondId] = React.useState("1");
    const [step, setStep] = React.useState<"idle" | "approving" | "feeding" | "success">("idle");
    const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>();

    const amountInWei = React.useMemo(() => {
        try {
            return parseUnits(amount, 18);
        } catch {
            return BigInt(0);
        }
    }, [amount]);

    // 1. Check current allowance for MockOracle
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "allowance",
        args: address ? [address, CONTRACTS.MockOracle.address as `0x${string}`] : undefined,
    });

    // 2. Check balance
    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    // 3. Transactions
    const { writeContractAsync: approve } = useWriteContract();
    const { writeContractAsync: feed } = useWriteContract();

    const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Refresh data after tx
    React.useEffect(() => {
        if (!isWaitingForTx && txHash) {
            refetchAllowance();
            refetchBalance();
            if (step === "approving") {
                setStep("idle");
                setTxHash(undefined);
            } else if (step === "feeding") {
                setStep("success");
                setTxHash(undefined);
                setAmount("");
            }
        }
    }, [isWaitingForTx, txHash, step, refetchAllowance, refetchBalance]);

    const handleApprove = async () => {
        try {
            setStep("approving");
            const hash = await approve({
                address: CONTRACTS.MockUSDC.address as `0x${string}`,
                abi: CONTRACTS.MockUSDC.abi,
                functionName: "approve",
                args: [CONTRACTS.MockOracle.address as `0x${string}`, amountInWei],
            });
            setTxHash(hash);
        } catch (error) {
            console.error("Approve error:", error);
            setStep("idle");
        }
    };

    const handleFeed = async () => {
        try {
            setStep("feeding");
            const hash = await feed({
                address: CONTRACTS.MockOracle.address as `0x${string}`,
                abi: CONTRACTS.MockOracle.abi,
                functionName: "setAssetData",
                args: [BigInt(bondId), amountInWei],
            });
            setTxHash(hash);
        } catch (error) {
            console.error("Feed error:", error);
            setStep("idle");
        }
    };

    const handleReset = () => {
        setAmount("");
        setStep("idle");
        setTxHash(undefined);
    };

    const isAmountZero = !amount || parseUnits(amount, 18) === BigInt(0);
    const needsApprove = !isAmountZero && allowance !== undefined && (allowance as bigint) < amountInWei;
    const isProcessing = step !== "idle" && step !== "success";
    const insufficientBalance = !isAmountZero && usdcBalance !== undefined && (usdcBalance as bigint) < amountInWei;

    return (
        <Card className="border-neutral-200 shadow-xl shadow-neutral-100 overflow-hidden rounded-3xl bg-neutral-50/30">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                        <HugeiconsIcon icon={AiCloudIcon} size={32} />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Oracle Gateway Simulator</CardTitle>
                        <CardDescription className="text-blue-100 font-medium italic">
                            Phase 1: Manual off-chain data injection.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
                {/* Bond Selection */}
                <div className="space-y-4">
                    <Label className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                        <HugeiconsIcon icon={ZapIcon} size={14} className="text-amber-500" />
                        Target Asset Stream
                    </Label>
                    <Select value={bondId} onValueChange={(val) => val && setBondId(val)} disabled={isProcessing}>
                        <SelectTrigger className="w-full h-12 rounded-xl bg-white border-neutral-200 font-bold shadow-sm">
                            <SelectValue placeholder="Select a bond" />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_BONDS.map((bond) => (
                                <SelectItem key={bond.id} value={bond.id} className="font-medium">
                                    <span className="font-bold mr-2 text-blue-600">#{bond.id}</span> {bond.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center justify-between">
                        <span>Simulated Interest Accrual</span>
                        <span className="text-blue-600 text-[10px] font-black bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">REAL-TIME FEED</span>
                    </label>

                    <div className="relative group">
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-3xl font-black h-20 pl-14 border-2 border-neutral-200 focus:border-blue-600 focus:ring-0 transition-all rounded-2xl shadow-inner bg-white"
                            placeholder="0.00"
                            disabled={isProcessing}
                        />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-blue-600 transition-colors">
                            <HugeiconsIcon icon={Database01Icon} size={24} />
                        </div>
                    </div>
                </div>

                {/* Status Indicator */}
                {(isProcessing || isWaitingForTx || step === "success") && (
                    <div className="space-y-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-blue-900 tracking-tight">
                                {step === "approving" && (isWaitingForTx ? "Waiting for Approval..." : "Oracle Step 1: Granting USDC Access")}
                                {step === "feeding" && (isWaitingForTx ? "Encrypting & Sending Data..." : "Oracle Step 2: Triggering On-chain Distribution")}
                                {step === "success" && "Data Verified & Yield Distributed!"}
                            </span>
                            {(isProcessing || isWaitingForTx) && (
                                <HugeiconsIcon icon={Loading03Icon} className="animate-spin text-blue-600" size={20} />
                            )}
                            {step === "success" && (
                                <div className="p-1 bg-blue-600 text-white rounded-full">
                                    <HugeiconsIcon icon={Tick01Icon} size={14} />
                                </div>
                            )}
                        </div>
                        <Progress
                            value={step === "approving" ? 50 : step === "feeding" ? 90 : step === "success" ? 100 : 0}
                            className="h-2 bg-blue-100 overflow-hidden rounded-full [&>div]:bg-blue-600"
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                {step === "success" ? (
                    <div className="w-full py-6 bg-white border border-blue-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
                        <h4 className="text-lg font-black text-blue-900">Oracle Update Successful</h4>
                        <p className="text-xs font-bold text-neutral-500">Investors will see their updated earnings in real-time.</p>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleReset}
                            className="text-blue-600 font-black uppercase tracking-widest text-[10px] mt-2 underline"
                        >
                            Log Another Event
                        </Button>
                    </div>
                ) : (
                    <>
                        {needsApprove ? (
                            <Button
                                onClick={handleApprove}
                                disabled={isProcessing || isWaitingForTx || insufficientBalance || !address || isAmountZero}
                                className="w-full h-16 text-xl font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xl shadow-blue-100"
                            >
                                {isProcessing ? "Oracle Processing..." : "Enable Oracle Funding"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFeed}
                                disabled={isProcessing || isWaitingForTx || insufficientBalance || !address || isAmountZero}
                                className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white transition-all shadow-xl shadow-blue-200 group"
                            >
                                <HugeiconsIcon icon={ZapIcon} className="mr-2 group-hover:scale-125 transition-transform" />
                                {isProcessing ? "Syncing Data..." : "Trigger Oracle Feed"}
                            </Button>
                        )}

                        <div className="p-4 bg-white/50 rounded-2xl border border-neutral-100">
                            <p className="text-[10px] font-bold text-neutral-400 leading-relaxed italic">
                                Note: In Phase 2, this action will be automated by an off-chain listener monitored by BondBase's secure gateway.
                            </p>
                        </div>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
