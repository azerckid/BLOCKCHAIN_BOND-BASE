import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { db } from "@/db";
import { choonsimRevenue, choonsimProjects, choonsimMilestones, choonsimMetricsHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { relayDepositYield } from "@/lib/relayer";

const CHOONSIM_BOND_ID = 101;
const RINA_BOND_ID = 102;
const DEFAULT_BOND_ID = CHOONSIM_BOND_ID;

/** 허용 bondId 화이트리스트 (07_MULTI_CHARACTER_BOND_SPEC) */
const ALLOWED_BOND_IDS = [CHOONSIM_BOND_ID, RINA_BOND_ID] as const;

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

/** 최상위 bondId (선택). 생략 시 DEFAULT_BOND_ID(101) */
const bondIdSchema = z.number().int().positive().optional();

function jsonResponse(body: object, status: number) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function getOrCreateProjectByBondId(bondId: number) {
    const projectId = bondId === CHOONSIM_BOND_ID ? "choonsim-main" : `bond-${bondId}`;
    const name = bondId === CHOONSIM_BOND_ID ? "Chunsim AI-Talk" : bondId === RINA_BOND_ID ? "Rina" : `Bond ${bondId}`;
    const existing = await db.query.choonsimProjects.findFirst({
        where: eq(choonsimProjects.bondId, bondId),
    });
    if (existing) return existing;
    const byId = await db.query.choonsimProjects.findFirst({
        where: eq(choonsimProjects.id, projectId),
    });
    if (byId) {
        if (byId.bondId == null) {
            await db.update(choonsimProjects).set({ bondId, updatedAt: new Date().getTime() }).where(eq(choonsimProjects.id, projectId));
        }
        return { ...byId, bondId: byId.bondId ?? bondId };
    }
    await db.insert(choonsimProjects).values({
        id: projectId,
        bondId,
        name,
        updatedAt: new Date().getTime(),
    });
    return { id: projectId, bondId, name, totalFollowers: 0, totalSubscribers: 0, southAmericaShare: 70, japanShare: 30, otherRegionShare: 0, updatedAt: new Date().getTime() };
}

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    const authHeader = request.headers.get("Authorization");
    const apiKey = getEnv("CHOONSIM_API_KEY");

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const body = (await request.json()) as Record<string, unknown>;
        const bondIdParsed = bondIdSchema.safeParse(body.bondId);
        const bondId = bondIdParsed.success && bondIdParsed.data != null
            ? bondIdParsed.data
            : DEFAULT_BOND_ID;
        if (!ALLOWED_BOND_IDS.includes(bondId as typeof ALLOWED_BOND_IDS[number])) {
            return jsonResponse({ success: false, error: "Invalid request", details: { fieldErrors: { bondId: ["bondId not in allowed list"] } } }, 400);
        }

        const parsed = apiRevenueBodySchema.safeParse(body);
        if (!parsed.success) {
            return jsonResponse({ success: false, error: "Invalid request", details: parsed.error.flatten() }, 400);
        }
        const { type, data } = parsed.data;

        const project = await getOrCreateProjectByBondId(bondId);

        if (type === "REVENUE") {
            const { amount: amountNum, source, description } = data;

            await db.insert(choonsimRevenue).values({
                id: randomUUID(),
                projectId: project.id,
                amount: Math.round(amountNum),
                source,
                description,
                receivedAt: new Date().getTime(),
                onChainTxHash: null,
            });

            if (source === "SUBSCRIPTION") {
                await db.update(choonsimProjects)
                    .set({
                        totalSubscribers: (project.totalSubscribers ?? 0) + 1,
                        updatedAt: new Date().getTime()
                    })
                    .where(eq(choonsimProjects.id, project.id));
            }

            return jsonResponse({ success: true, onChainHash: null });

        } else if (type === "MILESTONE") {
            const { key, description, achievedAt, bonusAmount } = data;
            await db.insert(choonsimMilestones).values({
                id: randomUUID(),
                projectId: project.id,
                key,
                description,
                achievedAt: achievedAt || new Date().getTime(),
                bonusAmount,
            });

            if (bonusAmount && parseFloat(bonusAmount) > 0) {
                await relayDepositYield(bondId, bonusAmount);
            }
        } else if (type === "METRICS") {
            const { followers, subscribers, shares } = data;

            await db.update(choonsimProjects)
                .set({
                    totalFollowers: followers,
                    totalSubscribers: subscribers,
                    southAmericaShare: shares?.southAmerica ?? 70,
                    japanShare: shares?.japan ?? 30,
                    otherRegionShare: shares?.other ?? 0,
                    updatedAt: new Date().getTime()
                })
                .where(eq(choonsimProjects.id, project.id));

            await db.insert(choonsimMetricsHistory).values({
                id: randomUUID(),
                projectId: project.id,
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
