import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Wallet01Icon,
    Unlink01Icon,
    CheckmarkBadge01Icon,
    Alert01Icon,
    Link01Icon,
    CoinsIcon,
    Loading03Icon
} from "@hugeicons/core-free-icons";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { creditcoinTestnet } from "@/config/wagmi";
import { CONTRACTS } from "@/config/contracts";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";
import * as React from "react";

export function WalletSection() {
    const { address, isConnected, chain } = useAccount();
    const { connect, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Faucet Logic
    const { writeContract: writeMint, data: mintHash, isPending: isMinting, error: mintError } = useWriteContract();
    const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });

    // Balance Check
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.MockUSDC.address as `0x${string}`,
        abi: CONTRACTS.MockUSDC.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 3000 // Check balance every 3s
        },
    });

    const isWrongNetwork = isConnected && chainId !== creditcoinTestnet.id;

    // Address formatting helper
    const shortAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "";

    const handleConnect = () => {
        connect({ connector: injected() });
    };

    const handleSwitchNetwork = () => {
        switchChain({ chainId: creditcoinTestnet.id });
    };

    const handleMint = () => {
        if (!address) return;
        writeMint({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: "mint",
            args: [address, parseUnits("1000", 18)],
        });
    };

    React.useEffect(() => {
        if (isMintSuccess) {
            toast.success("1,000 MockUSDC minted successfully!");
            refetchBalance();
        }
        if (mintError) {
            toast.error(`Mint failed: ${mintError.message}`);
        }
    }, [isMintSuccess, mintError]);

    if (!isMounted) return null;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900">Connected Wallet</h3>
                <p className="text-sm text-neutral-500">Manage your connected wallet for transactions.</p>
            </div>

            {!isConnected ? (
                <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-900 mb-2">
                            <HugeiconsIcon icon={Wallet01Icon} size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-lg text-neutral-900">No Wallet Connected</h4>
                            <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                                Connect your wallet to view your assets and start investing in RWA bonds.
                            </p>
                        </div>
                        <Button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-11 px-6 rounded-xl gap-2 mt-2"
                        >
                            {isConnecting ? "Connecting..." : "Connect Wallet"}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
                                        <HugeiconsIcon icon={Wallet01Icon} size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-neutral-900">Wallet</h4>
                                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[10px] px-2 h-5 gap-1">
                                                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={12} />
                                                Connected
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-mono bg-neutral-100 text-neutral-600 px-2 py-1 rounded truncate max-w-[200px] sm:max-w-xs">
                                            {shortAddress}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => disconnect()}
                                    variant="outline"
                                    className="border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold h-9 rounded-xl gap-2 w-full sm:w-auto"
                                >
                                    <HugeiconsIcon icon={Unlink01Icon} size={16} />
                                    Disconnect
                                </Button>
                            </div>

                            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <HugeiconsIcon icon={CoinsIcon} size={16} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Your Balance</p>
                                        <p className="text-sm font-medium text-neutral-400">MockUSDC (Testnet)</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-neutral-900 tracking-tight">
                                        {balance ? Number(formatUnits(balance as bigint, 18)).toLocaleString() : "0"}
                                    </p>
                                    <p className="text-xs font-bold text-neutral-400">USDC</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {isWrongNetwork ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
                            <div className="text-amber-500 mt-0.5">
                                <HugeiconsIcon icon={Alert01Icon} size={20} />
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-sm text-amber-900">Wrong Network</h5>
                                <p className="text-xs text-amber-700 mt-1 mb-3">
                                    You are connected to an unsupported network. Please switch to <span className="font-bold">Creditcoin Testnet</span>.
                                </p>
                                <Button
                                    onClick={handleSwitchNetwork}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-white border-amber-200 text-amber-800 hover:bg-amber-100 font-bold text-xs"
                                >
                                    Switch Network
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-start gap-3">
                                <div className="text-green-500 mt-0.5">
                                    <HugeiconsIcon icon={Link01Icon} size={20} />
                                </div>
                                <div>
                                    <h5 className="font-bold text-sm text-neutral-900">Network Status</h5>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        You are currently connected to <span className="font-bold text-neutral-700">{chain?.name || "Creditcoin Testnet"}</span>.
                                    </p>
                                </div>
                            </div>

                            {/* Faucet Section for Quick Testing */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="text-blue-500 mt-0.5">
                                        <HugeiconsIcon icon={CoinsIcon} size={20} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm text-blue-900">Testnet Faucet</h5>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Need tokens for testing? Get free MockUSDC.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleMint}
                                    disabled={isMinting || isMintConfirming}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 rounded-xl gap-2 text-xs"
                                >
                                    {(isMinting || isMintConfirming) && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={14} />}
                                    Get 1,000 USDC
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
