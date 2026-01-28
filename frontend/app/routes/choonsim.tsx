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
import { formatUnits } from "viem";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useAccount, useReadContract } from "wagmi";

export async function loader() {
    const CHOONSIM_BOND_ID = 101;

    // 1. Fetch Project Main Data
    const project = await db.query.choonsimProjects.findFirst({
        where: eq(choonsimProjects.id, "choonsim-main")
    });

    // 2. Fetch History for Charts
    const rawHistory = await db.query.choonsimMetricsHistory.findMany({
        where: eq(choonsimMetricsHistory.projectId, "choonsim-main"),
        orderBy: [desc(choonsimMetricsHistory.recordedAt)],
        limit: 7
    });

    // 3. Fetch Total Revenue
    const revenueResult = await db.select({
        total: sql<number>`sum(${choonsimRevenue.amount})`
    })
        .from(choonsimRevenue)
        .where(eq(choonsimRevenue.projectId, "choonsim-main"));

    // 4. Fetch Milestones
    const milestonesList = await db.query.choonsimMilestones.findMany({
        where: eq(choonsimMilestones.projectId, "choonsim-main"),
        orderBy: [desc(choonsimMilestones.achievedAt)]
    });

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
            const hash = await getWalletClient().writeContract({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'claimYield',
                args: [CHOONSIM_BOND_ID],
                account: getRelayerAccount(),
                chain: creditcoinTestnet
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
            const hash = await getWalletClient().writeContract({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'reinvest',
                args: [CHOONSIM_BOND_ID],
                account: getRelayerAccount(),
                chain: creditcoinTestnet
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

    return (
        <DashboardLayout>
            <ChoonsimDashboard
                project={enrichedProject as any}
                history={data.history}
                milestones={data.milestones}
                onClaim={handleClaim}
                onReinvest={handleReinvest}
                isLoading={isPending}
            />
        </DashboardLayout>
    );
}
