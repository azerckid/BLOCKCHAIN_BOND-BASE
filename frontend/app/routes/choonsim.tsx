import { ChoonsimDashboard } from "@/components/bonds/choonsim-dashboard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { db } from "@/db";
import { choonsimProjects, choonsimMetricsHistory, choonsimRevenue, choonsimMilestones } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { useLoaderData, useRevalidator } from "react-router";
import { DateTime } from "luxon";
import { publicClient, walletClient } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { formatUnits } from "viem";
import { useState } from "react";
import { toast } from "sonner";

// Use the tester address as the "Logged in Provider" for demo
const TEST_USER_ADDRESS = "0xf42138298fa1Fc8514BC17D59eBB451AceF3cDBa";

export async function loader() {
    const CHOONSIM_BOND_ID = 101;

    // 1. Fetch Project Main Data
    const project = await db.query.choonsimProjects.findFirst({
        where: eq(choonsimProjects.id, "choonsim-main")
    });

    // 2. Fetch On-chain Global Data
    let isAuditEnabled = false;
    let pendingYield = 0;
    let userEarnedYield = 0;
    let userBondBalance = 0;

    try {
        const [auditEnabled, pending, earned, balance] = await Promise.all([
            publicClient.readContract({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'requiresAudit',
                args: [BigInt(CHOONSIM_BOND_ID)]
            }),
            publicClient.readContract({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'pendingYield',
                args: [BigInt(CHOONSIM_BOND_ID)]
            }),
            publicClient.readContract({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'earned',
                args: [TEST_USER_ADDRESS, BigInt(CHOONSIM_BOND_ID)]
            }),
            publicClient.readContract({
                address: CONTRACTS.BondToken.address as `0x${string}`,
                abi: CONTRACTS.BondToken.abi,
                functionName: 'balanceOf',
                args: [TEST_USER_ADDRESS, BigInt(CHOONSIM_BOND_ID)]
            })
        ]);

        isAuditEnabled = Boolean(auditEnabled);
        pendingYield = Number(formatUnits(pending as bigint, 18));
        userEarnedYield = Number(formatUnits(earned as bigint, 18));
        userBondBalance = Number(formatUnits(balance as bigint, 18));
    } catch (e) {
        console.error("Failed to fetch on-chain data:", e);
    }

    // 3. Fetch History for Charts
    const rawHistory = await db.query.choonsimMetricsHistory.findMany({
        where: eq(choonsimMetricsHistory.projectId, "choonsim-main"),
        orderBy: [desc(choonsimMetricsHistory.recordedAt)],
        limit: 7
    });

    // 4. Fetch Total Revenue
    const revenueResult = await db.select({
        total: sql<number>`sum(${choonsimRevenue.amount})`
    })
        .from(choonsimRevenue)
        .where(eq(choonsimRevenue.projectId, "choonsim-main"));

    // 5. Fetch Milestones
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
            pendingYield,
            isAuditEnabled,
            userEarnedYield,
            userBondBalance
        },
        history: formattedHistory,
        milestones: milestonesList.map(m => ({
            key: m.key,
            title: m.description,
            date: DateTime.fromMillis(m.achievedAt).toISODate() || "",
            status: "ACHIEVED"
        }))
    };
}

export default function ChoonsimRoute() {
    const data = useLoaderData<typeof loader>();
    const revalidator = useRevalidator();
    const [isPending, setIsPending] = useState(false);

    const handleClaim = async () => {
        setIsPending(true);
        const promise = (async () => {
            const hash = await walletClient.writeContract({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'claimYield',
                args: [BigInt(101)]
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
            const hash = await walletClient.writeContract({
                address: CONTRACTS.YieldDistributor.address as `0x${string}`,
                abi: CONTRACTS.YieldDistributor.abi,
                functionName: 'reinvest',
                args: [BigInt(101)]
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
                project={data.project as any}
                history={data.history}
                milestones={data.milestones}
                onClaim={handleClaim}
                onReinvest={handleReinvest}
                isLoading={isPending}
            />
        </DashboardLayout>
    );
}
