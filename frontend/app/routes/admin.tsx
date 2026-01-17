import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAccount, useReadContract, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { CONTRACTS } from "@/config/contracts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Alert01Icon,
    Shield02Icon,
    PassportIcon,
    Configuration01Icon,
    Wallet02Icon
} from "@hugeicons/core-free-icons";

import { YieldDepositModule } from "@/components/admin/yield-deposit-module";
import { OracleTriggerModule } from "@/components/admin/oracle-trigger-module";

// DISTRIBUTOR_ROLE hash: keccak256("DISTRIBUTOR_ROLE")
const DISTRIBUTOR_ROLE = "0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c";

export default function AdminPage() {
    const { address, isConnected } = useAccount();
    const { connect, isPending: isConnecting } = useConnect();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Check if the user has DISTRIBUTOR_ROLE
    const { data: isDistributor, isLoading: isRoleLoading } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: "hasRole",
        args: address ? [DISTRIBUTOR_ROLE, address] : undefined,
        query: {
            enabled: !!address && isConnected,
        }
    });

    if (!isMounted) return null;

    if (!isConnected) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-700">
                    <div className="p-6 bg-amber-50 rounded-3xl text-amber-500 shadow-inner">
                        <HugeiconsIcon icon={PassportIcon} size={64} />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Admin Authentication Required</h1>
                        <p className="text-neutral-500 font-medium italic">Please connect an authorized administrator wallet to proceed.</p>
                    </div>
                    <Button
                        onClick={() => connect({ connector: injected() })}
                        disabled={isConnecting}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-12 px-8 rounded-2xl gap-2 shadow-xl shadow-neutral-200"
                    >
                        <HugeiconsIcon icon={Wallet02Icon} size={20} />
                        {isConnecting ? "Connecting..." : "Connect Admin Wallet"}
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    if (isRoleLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="animate-spin text-neutral-900">
                        <HugeiconsIcon icon={Configuration01Icon} size={48} />
                    </div>
                    <p className="mt-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Authenticating...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!isDistributor) {
        return (
            <DashboardLayout>
                <div className="max-w-xl mx-auto mt-20">
                    <Card className="border-red-100 bg-red-50/30 overflow-hidden rounded-3xl shadow-xl shadow-red-100/50">
                        <CardHeader className="text-center p-10">
                            <div className="mx-auto w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <HugeiconsIcon icon={Shield02Icon} size={40} />
                            </div>
                            <CardTitle className="text-3xl font-black text-red-900 tracking-tight">Access Restricted</CardTitle>
                            <CardDescription className="text-red-700/70 font-bold mt-2 font-mono break-all px-4">
                                {address}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-12 px-10">
                            <p className="text-red-800 font-medium leading-relaxed">
                                This wallet address is not registered as a protocol distributor.
                                <br /><span className="text-sm font-normal italic opacity-80">Check your account or request the DISTRIBUTOR_ROLE from governance.</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter text-neutral-900">Protocol Control</h1>
                            <div className="px-3 py-1 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-neutral-200">
                                Admin Mode
                            </div>
                        </div>
                        <p className="text-neutral-500 font-medium italic">High-level yield distribution and smart contract management.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left: Yield Distribution Module */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-10">
                        <OracleTriggerModule />

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-neutral-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Protocol Owner Override</span>
                            </div>
                        </div>

                        <YieldDepositModule />
                    </div>

                    {/* Right: Info & Stats */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                        <Card className="border-neutral-200 shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="bg-neutral-50 border-b border-neutral-100">
                                <CardTitle className="text-lg font-bold">Contract Registry</CardTitle>
                                <CardDescription className="text-xs font-medium uppercase tracking-wider">Live environment mapping</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">YieldDistributor</p>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    </div>
                                    <div className="p-3 bg-neutral-100 rounded-xl font-mono text-[11px] break-all border border-neutral-200/50">
                                        {CONTRACTS.YieldDistributor.address}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">MockUSDC Gateway</p>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    </div>
                                    <div className="p-3 bg-neutral-100 rounded-xl font-mono text-[11px] break-all border border-neutral-200/50">
                                        {CONTRACTS.MockUSDC.address}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-6 bg-neutral-900 text-white rounded-3xl shadow-xl shadow-neutral-200 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-lg font-black">Security Protocol</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                    All administrative actions are recorded permanently on the Creditcoin 2.0 blockchain with your address signature. Ensure you are using a secure hardware wallet for large-scale distributions.
                                </p>
                            </div>
                            <HugeiconsIcon
                                icon={Shield02Icon}
                                size={120}
                                className="absolute -bottom-8 -right-8 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
