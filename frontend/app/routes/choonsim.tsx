import { ChoonsimDashboard } from "@/components/bonds/choonsim-dashboard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { db } from "@/db";
import { choonsimProjects, choonsimMetricsHistory, choonsimRevenue, choonsimMilestones } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { useLoaderData, useRevalidator } from "react-router";
import { DateTime } from "luxon";
import { publicClient, getWalletClient, getRelayerAccount } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { creditcoinTestnet } from "@/config/wagmi";
import { formatUnits, parseUnits } from "viem";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

export async function loader() {
    const CHOONSIM_BOND_ID = 101;

    const [project, rawHistory, revenueResult, milestonesList] = await Promise.all([
        db.query.choonsimProjects.findFirst({
            where: eq(choonsimProjects.id, "choonsim-main"),
        }),
        db.query.choonsimMetricsHistory.findMany({
            where: eq(choonsimMetricsHistory.projectId, "choonsim-main"),
            orderBy: [desc(choonsimMetricsHistory.recordedAt)],
            limit: 7,
        }),
        db
            .select({ total: sql<number>`sum(${choonsimRevenue.amount})` })
            .from(choonsimRevenue)
            .where(eq(choonsimRevenue.projectId, "choonsim-main")),
        db.query.choonsimMilestones.findMany({
            where: eq(choonsimMilestones.projectId, "choonsim-main"),
            orderBy: [desc(choonsimMilestones.achievedAt)],
        }),
    ]);

    const formattedHistory = rawHistory.reverse().map(h => ({
        name: DateTime.fromMillis(h.recordedAt).toFormat("LLL dd"),
        followers: h.followers,
        revenue: Math.floor(h.followers * 0.1)
    }));

    return {
        project: {
            ...project,
            totalRevenue: Number(revenueResult[0]?.total || 0),
            currentApr: 18.5,
        },
        history: formattedHistory,
        milestones: milestonesList.map(m => ({
            key: m.key,
            title: m.description,
            date: DateTime.fromMillis(m.achievedAt).toISODate() || "",
            status: "ACHIEVED"
        })),
        BOND_ID: CHOONSIM_BOND_ID
    };
}

export default function ChoonsimRoute() {
    const data = useLoaderData<typeof loader>();
    const revalidator = useRevalidator();
    const [isPending, setIsPending] = useState(false);
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    const CHOONSIM_BOND_ID = BigInt(data.BOND_ID);

    // Dynamic On-chain Data Fetching
    const { data: requiresAudit } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: 'requiresAudit',
        args: [CHOONSIM_BOND_ID],
        query: { refetchInterval: 10000 }
    });

    const { data: pendingYieldOnChain } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: 'pendingYield',
        args: [CHOONSIM_BOND_ID],
        query: { refetchInterval: 10000 }
    });

    const { data: earnedYield } = useReadContract({
        address: CONTRACTS.YieldDistributor.address as `0x${string}`,
        abi: CONTRACTS.YieldDistributor.abi,
        functionName: 'earned',
        args: address ? [address as `0x${string}`, CHOONSIM_BOND_ID] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    const { data: bondBalance } = useReadContract({
        address: CONTRACTS.BondToken.address as `0x${string}`,
        abi: CONTRACTS.BondToken.abi,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`, CHOONSIM_BOND_ID] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 }
    });

    const enrichedProject = useMemo(() => ({
        ...data.project,
        isAuditEnabled: Boolean(requiresAudit),
        pendingYield: pendingYieldOnChain ? Number(formatUnits(pendingYieldOnChain as bigint, 18)) : 0,
        userEarnedYield: earnedYield ? Number(formatUnits(earnedYield as bigint, 18)) : 0,
        userBondBalance: bondBalance ? Number(formatUnits(bondBalance as bigint, 18)) : 0,
    }), [data.project, requiresAudit, pendingYieldOnChain, earnedYield, bondBalance]);

    const handleClaim = async () => {
        setIsPending(true);
        const promise = (async () => {
            const hash = await writeContractAsync({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'claimYield',
                args: [CHOONSIM_BOND_ID],
            });
            await publicClient.waitForTransactionReceipt({ hash });
            revalidator.revalidate();
        })();

        toast.promise(promise, {
            loading: 'Claiming your USDC yield...',
            success: 'Yield claimed successfully!',
            error: 'Failed to claim yield.',
        });

        try { await promise; } finally { setIsPending(false); }
    };

    const handleReinvest = async () => {
        setIsPending(true);
        const promise = (async () => {
            const hash = await writeContractAsync({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'reinvest',
                args: [CHOONSIM_BOND_ID],
            });
            await publicClient.waitForTransactionReceipt({ hash });
            revalidator.revalidate();
        })();

        toast.promise(promise, {
            loading: 'Reinvesting yield into growth bonds...',
            success: 'Successfully reinvested! Your bond balance has increased.',
            error: 'Failed to reinvest yield.',
        });

        try { await promise; } finally { setIsPending(false); }
    };

    const handleInvest = async () => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsPending(true);
        const investAmount = parseUnits("100", 18);

        const promise = (async () => {
            // 1. Approve LiquidityPool to spend USDC (User signs via MetaMask)
            const allowance = await publicClient.readContract({
                address: CONTRACTS.MockUSDC.address as `0x${string}`,
                abi: CONTRACTS.MockUSDC.abi,
                functionName: 'allowance',
                args: [address as `0x${string}`, CONTRACTS.LiquidityPool.address as `0x${string}`],
            }) as bigint;

            if (allowance < investAmount) {
                const approveHash = await writeContractAsync({
                    address: CONTRACTS.MockUSDC.address as `0x${string}`,
                    abi: CONTRACTS.MockUSDC.abi,
                    functionName: 'approve',
                    args: [CONTRACTS.LiquidityPool.address as `0x${string}`, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")],
                });
                // Wait for approval receipt
                await publicClient.waitForTransactionReceipt({ hash: approveHash });
            }

            // 2. Purchase Bond (User signs via MetaMask)
            const hash = await writeContractAsync({
                address: CONTRACTS.LiquidityPool.address as `0x${string}`,
                abi: CONTRACTS.LiquidityPool.abi,
                functionName: 'purchaseBond',
                args: [CHOONSIM_BOND_ID, investAmount],
            });
            await publicClient.waitForTransactionReceipt({ hash });

            revalidator.revalidate();
        })();

        toast.promise(promise, {
            loading: 'Processing your 100 USDC investment...',
            success: 'Successfully invested in Choonsim Bonds!',
            error: 'Failed to complete investment.',
        });

        try { await promise; } finally { setIsPending(false); }
    };

    return (
        <DashboardLayout>
            <ChoonsimDashboard
                project={enrichedProject as any}
                history={data.history}
                milestones={data.milestones}
                onClaim={handleClaim}
                onReinvest={handleReinvest}
                onInvest={handleInvest}
                isLoading={isPending}
            />
        </DashboardLayout>
    );
}
