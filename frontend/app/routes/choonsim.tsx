import { ChoonsimDashboard } from "@/components/bonds/choonsim-dashboard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { db } from "@/db";
import { choonsimProjects, choonsimMetricsHistory, choonsimRevenue, choonsimMilestones } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { useLoaderData } from "react-router";
import { DateTime } from "luxon";
import { publicClient } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { formatUnits } from "viem";

export async function loader() {
    const CHOONSIM_BOND_ID = 101;

    // 1. Fetch Project Main Data from DB
    const project = await db.query.choonsimProjects.findFirst({
        where: eq(choonsimProjects.id, "choonsim-main")
    });

    // 2. Fetch On-chain Audit Data (Real-time)
    let isAuditEnabled = false;
    let pendingYield = 0;

    try {
        const auditEnabledResult = await publicClient.readContract({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: 'requiresAudit',
            args: [BigInt(CHOONSIM_BOND_ID)]
        });
        isAuditEnabled = Boolean(auditEnabledResult);

        const pendingYieldResult = await publicClient.readContract({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: 'pendingYield',
            args: [BigInt(CHOONSIM_BOND_ID)]
        });
        pendingYield = Number(formatUnits(pendingYieldResult as bigint, 18));
    } catch (e) {
        console.error("Failed to fetch on-chain data:", e);
    }

    // 3. Fetch History for Charts (Last 7 records)
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

    // Formatting for Dashboard
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
            isAuditEnabled
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

    return (
        <DashboardLayout>
            <ChoonsimDashboard
                project={data.project as any}
                history={data.history}
                milestones={data.milestones}
            />
        </DashboardLayout>
    );
}
