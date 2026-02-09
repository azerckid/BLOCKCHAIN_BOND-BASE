import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { db } from "@/db";
import { choonsimRevenue, choonsimProjects, choonsimMilestones, choonsimMetricsHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { relayDepositYield } from "@/lib/relayer";

const CHOONSIM_BOND_ID = 101; // Defined in smart contract deployment/tests

const REVENUE_AMOUNT_MAX = 1_000_000;

const revenueDataSchema = z.object({
    amount: z.string().regex(/^\d+(\.\d+)?$/, "amount must be a non-negative number string").transform((s) => parseFloat(s)).pipe(z.number().min(0.01).max(REVENUE_AMOUNT_MAX)),
    source: z.string().min(1),
    description: z.string(),
});
const milestoneDataSchema = z.object({
    key: z.string().min(1),
    description: z.string(),
    achievedAt: z.number().optional(),
    bonusAmount: z.string().optional(),
});
const metricsDataSchema = z.object({
    followers: z.number().int().min(0),
    subscribers: z.number().int().min(0),
    shares: z.object({
        southAmerica: z.number().optional(),
        japan: z.number().optional(),
        other: z.number().optional(),
    }).optional(),
});

const apiRevenueBodySchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("REVENUE"), data: revenueDataSchema }),
    z.object({ type: z.literal("MILESTONE"), data: milestoneDataSchema }),
    z.object({ type: z.literal("METRICS"), data: metricsDataSchema }),
]);

function jsonResponse(body: object, status: number) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.CHOONSIM_API_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = apiRevenueBodySchema.safeParse(body);
        if (!parsed.success) {
            return jsonResponse({ success: false, error: "Invalid request", details: parsed.error.flatten() }, 400);
        }
        const { type, data } = parsed.data;

        // Ensure Choonsim project exists
        const project = await db.query.choonsimProjects.findFirst({
            where: eq(choonsimProjects.id, "choonsim-main"),
        });

        if (!project) {
            await db.insert(choonsimProjects).values({
                id: "choonsim-main",
                name: "Chunsim AI-Talk",
                updatedAt: new Date().getTime(),
            });
        }

        if (type === "REVENUE") {
            const { amount: amountNum, source, description } = data;

            await db.insert(choonsimRevenue).values({
                id: randomUUID(),
                projectId: "choonsim-main",
                amount: Math.round(amountNum),
                source,
                description,
                receivedAt: new Date().getTime(),
                onChainTxHash: null,
            });

            // 3. Update project totals
            if (source === "SUBSCRIPTION") {
                await db.update(choonsimProjects)
                    .set({
                        totalSubscribers: (project?.totalSubscribers || 0) + 1,
                        updatedAt: new Date().getTime()
                    })
                    .where(eq(choonsimProjects.id, "choonsim-main"));
            }

            return jsonResponse({ success: true, onChainHash: null });

        } else if (type === "MILESTONE") {
            const { key, description, achievedAt, bonusAmount } = data;
            await db.insert(choonsimMilestones).values({
                id: randomUUID(),
                projectId: "choonsim-main",
                key,
                description,
                achievedAt: achievedAt || new Date().getTime(),
                bonusAmount,
            });

            // Optional: Milestone bonus can also be relayed if needed
            if (bonusAmount && parseFloat(bonusAmount) > 0) {
                await relayDepositYield(CHOONSIM_BOND_ID, bonusAmount);
            }
        } else if (type === "METRICS") {
            const { followers, subscribers, shares } = data;

            // 1. Update Project Main Stats
            await db.update(choonsimProjects)
                .set({
                    totalFollowers: followers,
                    totalSubscribers: subscribers,
                    southAmericaShare: shares?.southAmerica || 70,
                    japanShare: shares?.japan || 30,
                    otherRegionShare: shares?.other || 0,
                    updatedAt: new Date().getTime()
                })
                .where(eq(choonsimProjects.id, "choonsim-main"));

            // 2. Record to History (for charts)
            await db.insert(choonsimMetricsHistory).values({
                id: randomUUID(),
                projectId: "choonsim-main",
                followers,
                subscribers,
                recordedAt: new Date().getTime(),
            });
        }

        return jsonResponse({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return jsonResponse({ success: false, error: message }, 500);
    }
}
