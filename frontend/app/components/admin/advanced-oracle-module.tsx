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
    ActivityIcon,
    Tick01Icon,
    Loading03Icon,
    Alert01Icon,
    Shield02Icon,
    Database01Icon,
    AiCloudIcon,
    Wallet02Icon,
    PassportIcon,
    Configuration01Icon
} from "@hugeicons/core-free-icons";

import { MOCK_BONDS } from "@/routes/bonds";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function AdvancedOracleModule() {
    const { address } = useAccount();
    const [bondId, setBondId] = React.useState("1");
    const [principalPaid, setPrincipalPaid] = React.useState("");
    const [interestPaid, setInterestPaid] = React.useState("");
    const [status, setStatus] = React.useState("0"); // 0: Active, 1: Repaid, 2: Default
    const [verifyProof, setVerifyProof] = React.useState("");

    // ESG Impact Data State
    const [carbonReduced, setCarbonReduced] = React.useState("");
    const [jobsCreated, setJobsCreated] = React.useState("");
    const [smeSupported, setSmeSupported] = React.useState("");
    const [reportUrl, setReportUrl] = React.useState("");

    const [step, setStep] = React.useState<"idle" | "approving" | "updating" | "success">("idle");
    const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>();

    // 1. Fetch current performance from on-chain
    const { data: currentPerformance, refetch: refetchPerformance } = useReadContract({
        address: CONTRACTS.OracleAdapter.address as `0x${string}`,
        abi: CONTRACTS.OracleAdapter.abi,
        functionName: "getAssetPerformance",
        args: [BigInt(bondId)],
    });

    // 2. Check USDC allowance and balance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "allowance",
        args: address ? [address, CONTRACTS.OracleAdapter.address as `0x${string}`] : undefined,
    });

    const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    // Parse amounts
    const principalInWei = React.useMemo(() => {
        try { return parseUnits(principalPaid || "0", 18); } catch { return BigInt(0); }
    }, [principalPaid]);

    const interestInWei = React.useMemo(() => {
        try { return parseUnits(interestPaid || "0", 18); } catch { return BigInt(0); }
    }, [interestPaid]);

    const currentInterestInWei = currentPerformance ? (currentPerformance as any).interestPaid : BigInt(0);
    const neededInterestAddition = interestInWei > currentInterestInWei ? interestInWei - currentInterestInWei : BigInt(0);

    // 3. Transactions
    const { writeContractAsync: approve } = useWriteContract();
    const { writeContractAsync: updateStatus } = useWriteContract();

    const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Refresh after tx
    React.useEffect(() => {
        if (!isWaitingForTx && txHash) {
            refetchPerformance();
            refetchAllowance();
            refetchBalance();
            if (step === "approving") {
                setStep("idle");
                setTxHash(undefined);
            } else if (step === "updating") {
                setStep("success");
                setTxHash(undefined);
            }
        }
    }, [isWaitingForTx, txHash, step, refetchPerformance, refetchAllowance, refetchBalance]);

    const handleApprove = async () => {
        try {
            setStep("approving");
            const hash = await approve({
                address: CONTRACTS.MockUSDC.address as `0x${string}`,
                abi: CONTRACTS.MockUSDC.abi,
                functionName: "approve",
                args: [CONTRACTS.OracleAdapter.address as `0x${string}`, neededInterestAddition],
            });
            setTxHash(hash);
        } catch (error) {
            console.error(error);
            setStep("idle");
        }
    };

    const handleUpdate = async () => {
        try {
            setStep("updating");
            const perf = {
                timestamp: BigInt(Math.floor(Date.now() / 1000)),
                principalPaid: principalInWei,
                interestPaid: interestInWei,
                status: Number(status),
                verifyProof: verifyProof || "Simulation Proof"
            };
            const impact = {
                carbonReduced: BigInt(carbonReduced || 0),
                jobsCreated: BigInt(jobsCreated || 0),
                smeSupported: BigInt(smeSupported || 0),
                reportUrl: reportUrl || ""
            };
            const hash = await updateStatus({
                address: CONTRACTS.OracleAdapter.address as `0x${string}`,
                abi: CONTRACTS.OracleAdapter.abi,
                functionName: "updateAssetStatus",
                args: [BigInt(bondId), perf, impact],
            });
            setTxHash(hash);
        } catch (error) {
            console.error(error);
            setStep("idle");
        }
    };

    const needsApprove = neededInterestAddition > BigInt(0) && (allowance === undefined || (allowance as bigint) < neededInterestAddition);
    const isProcessing = step !== "idle" && step !== "success";

    return (
        <Card className="border-neutral-200 shadow-2xl shadow-neutral-100 overflow-hidden rounded-[2.5rem] bg-white border-t-8 border-t-indigo-600">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
                            <HugeiconsIcon icon={AiCloudIcon} size={32} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight text-neutral-900">Advanced Oracle Hub</CardTitle>
                            <CardDescription className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Phase 2: Structured Asset Performance Feed</CardDescription>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-neutral-900 rounded-2xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Gateway</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 space-y-10">
                {/* Current State Indicator */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-neutral-50 rounded-3xl border border-neutral-100 space-y-1">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">On-chain Principal</p>
                        <p className="text-xl font-black text-neutral-900">
                            ${currentPerformance ? Number(formatUnits((currentPerformance as any).principalPaid, 18)).toLocaleString() : "0.00"}
                        </p>
                    </div>
                    <div className="p-5 bg-neutral-50 rounded-3xl border border-neutral-100 space-y-1">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">On-chain Interest</p>
                        <p className="text-xl font-black text-indigo-600">
                            ${currentPerformance ? Number(formatUnits((currentPerformance as any).interestPaid, 18)).toLocaleString() : "0.00"}
                        </p>
                    </div>
                    <div className="p-5 bg-neutral-50 rounded-3xl border border-neutral-100 space-y-1">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Last Status</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${currentPerformance && (currentPerformance as any).status === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                            <p className="text-lg font-black text-neutral-900 uppercase italic tracking-tighter">
                                {currentPerformance ? ((currentPerformance as any).status === 0 ? "Active" : (currentPerformance as any).status === 1 ? "Repaid" : "Default") : "Unknown"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Input Form */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Select Asset Stream</Label>
                                <Select value={bondId} onValueChange={(val) => val && setBondId(val)}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-neutral-50 border-neutral-100 font-bold text-neutral-900 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {MOCK_BONDS.map(b => (
                                            <SelectItem key={b.id} value={b.id}>Bond #{b.id} - {b.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Cumulative Principal Paid ($)</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 transition-colors group-focus-within:text-neutral-900">
                                        <HugeiconsIcon icon={PassportIcon} size={20} />
                                    </div>
                                    <Input
                                        type="number"
                                        value={principalPaid}
                                        onChange={e => setPrincipalPaid(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl bg-neutral-50 border-neutral-100 font-black text-lg focus:bg-white transition-all shadow-inner"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Cumulative Interest Paid ($)</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 transition-colors group-focus-within:text-indigo-600">
                                        <HugeiconsIcon icon={Database01Icon} size={20} />
                                    </div>
                                    <Input
                                        type="number"
                                        value={interestPaid}
                                        onChange={e => setInterestPaid(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl bg-neutral-50 border-indigo-50 font-black text-lg text-indigo-600 focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Input Form Continued */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Asset Operational Status</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(s.toString())}
                                            className={`h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${status === s.toString()
                                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg'
                                                : 'bg-neutral-50 text-neutral-400 border-neutral-100 hover:border-neutral-200'
                                                }`}
                                        >
                                            {s === 0 ? "Active" : s === 1 ? "Repaid" : "Default"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Verification Proof (IPFS/URL)</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 transition-colors group-focus-within:text-neutral-900">
                                        <HugeiconsIcon icon={Shield02Icon} size={20} />
                                    </div>
                                    <Input
                                        type="text"
                                        value={verifyProof}
                                        onChange={e => setVerifyProof(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl bg-neutral-50 border-neutral-100 font-bold focus:bg-white transition-all shadow-inner"
                                        placeholder="ipfs://Qm..."
                                    />
                                </div>
                            </div>

                            {/* ESG Impact Section */}
                            <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4">
                                <Label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block">ESG Impact Metrics</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-neutral-400 uppercase">Carbon (kg)</Label>
                                        <Input
                                            type="number"
                                            value={carbonReduced}
                                            onChange={e => setCarbonReduced(e.target.value)}
                                            className="h-10 rounded-xl bg-white border-neutral-100 font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-neutral-400 uppercase">Jobs Created</Label>
                                        <Input
                                            type="number"
                                            value={jobsCreated}
                                            onChange={e => setJobsCreated(e.target.value)}
                                            className="h-10 rounded-xl bg-white border-neutral-100 font-bold text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-neutral-400 uppercase">SMEs Support</Label>
                                        <Input
                                            type="number"
                                            value={smeSupported}
                                            onChange={e => setSmeSupported(e.target.value)}
                                            className="h-10 rounded-xl bg-white border-neutral-100 font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-neutral-400 uppercase">Report URL</Label>
                                        <Input
                                            type="text"
                                            value={reportUrl}
                                            onChange={e => setReportUrl(e.target.value)}
                                            className="h-10 rounded-xl bg-white border-neutral-100 font-bold text-xs"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon icon={ActivityIcon} size={18} className="text-indigo-600" />
                                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Delta Calculation</p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase">New Yield to Distribute</p>
                                        <p className="text-2xl font-black text-indigo-600">${Number(formatUnits(neededInterestAddition, 18)).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase">System Integrity</p>
                                        <p className="text-xs font-black text-neutral-900">VERIFIED</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Visual */}
                {(isProcessing || isWaitingForTx || step === "success") && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                {step === "approving" ? "Awaiting Token Approval" : step === "updating" ? "Synchronizing Asset State" : "Transaction Finalized"}
                                {(isProcessing || isWaitingForTx) && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={12} />}
                            </span>
                            <span className="text-[10px] font-black text-indigo-600">
                                {txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : ""}
                            </span>
                        </div>
                        <Progress
                            value={step === "approving" ? 40 : step === "updating" ? 80 : 100}
                            className="h-2 rounded-full bg-neutral-100 [&>div]:bg-indigo-600"
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-8 pt-0">
                {step === "success" ? (
                    <div className="w-full flex items-center justify-between p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                <HugeiconsIcon icon={Tick01Icon} size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black">Success! Performance Synchronized</p>
                                <p className="text-[10px] font-medium opacity-80">On-chain state now matches off-chain source.</p>
                            </div>
                        </div>
                        <Button
                            variant="link"
                            onClick={() => { setStep("idle"); setInterestPaid(""); setPrincipalPaid(""); setTxHash(undefined); }}
                            className="text-white font-black text-[10px] uppercase border-b border-white/40 hover:no-underline rounded-none px-0"
                        >
                            Next Update
                        </Button>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={handleApprove}
                            disabled={!needsApprove || isProcessing || isWaitingForTx}
                            className={`h-16 rounded-[1.5rem] font-black text-lg transition-all ${needsApprove
                                ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-200'
                                : 'bg-neutral-100 text-neutral-300'
                                }`}
                        >
                            <HugeiconsIcon icon={Wallet02Icon} className="mr-2" size={20} />
                            {needsApprove ? "1. Approve Delta" : "Approved"}
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={needsApprove || isProcessing || isWaitingForTx || !principalPaid || !interestPaid}
                            className={`h-16 rounded-[1.5rem] font-black text-lg transition-all ${!needsApprove && principalPaid && interestPaid
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                                : 'bg-neutral-100 text-neutral-300'
                                }`}
                        >
                            <HugeiconsIcon icon={Configuration01Icon} className="mr-2 font-black" size={20} />
                            2. Sync Status
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
