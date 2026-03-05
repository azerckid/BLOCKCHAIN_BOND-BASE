/**
 * POST /api/demo
 * Body: { action: "tick" } | { action: "reset" }
 *
 * tick  — 랜덤 demo 투자자 yield 1건 삽입 후 이벤트 반환
 * reset — demo- prefix 데이터 삭제 후 재시딩
 */
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { db } from "@/db";
import { yieldDistributions, investments, investors, bonds } from "@/db/schema";
import { eq, like, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { DEMO_INVESTORS, ID_TO_NAME } from "@/lib/demo-investors";
import { seedDemo } from "@/lib/demo-seed.server";

const bodySchema = z.discriminatedUnion("action", [
    z.object({ action: z.literal("tick") }),
    z.object({ action: z.literal("reset") }),
]);

const APR = 0.185;
const DAILY_RATE = APR / 365;

function jsonRes(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function tickDemo() {
    const investor = DEMO_INVESTORS[Math.floor(Math.random() * DEMO_INVESTORS.length)];

    const invRows = await db
        .select({ usdcAmount: investments.usdcAmount, bondId: investments.bondId })
        .from(investments)
        .where(eq(investments.investorId, investor.id));

    if (invRows.length === 0) {
        // 시딩이 안 된 경우 — 조용히 다른 투자자로 fallback
        return jsonRes({ error: "no investments — run seed first" }, 404);
    }

    const totalUsdc = invRows.reduce((sum, r) => sum + r.usdcAmount, 0);
    const yieldAmount = Math.max(1, Math.floor(totalUsdc * DAILY_RATE));
    const pickedInv = invRows[Math.floor(Math.random() * invRows.length)];
    const ts = DateTime.now();

    await db.insert(yieldDistributions).values({
        id: `demo-yield-live-${crypto.randomUUID()}`,
        bondId: pickedInv.bondId,
        investorId: investor.id,
        yieldAmount,
        transactionHash: null,
        distributedAt: ts.toUnixInteger(),
    });

    return jsonRes({
        investorId: investor.id,
        investorName: ID_TO_NAME.get(investor.id) ?? investor.id,
        walletAddress: investor.walletAddress,
        yieldAmount,
        bondId: pickedInv.bondId,
        timestamp: ts.toISO(),
    });
}

async function resetDemo() {
    const demoInvestorIds = DEMO_INVESTORS.map((i) => i.id);

    // 역순 삭제: yieldDistributions → investments → investors → bonds
    if (demoInvestorIds.length > 0) {
        await db
            .delete(yieldDistributions)
            .where(inArray(yieldDistributions.investorId, demoInvestorIds));
        // live tick으로 생성된 yield (demo-yield-live-* 포함, bondId demo- 기준)
        await db
            .delete(yieldDistributions)
            .where(like(yieldDistributions.bondId, "demo-%"));
        await db
            .delete(investments)
            .where(inArray(investments.investorId, demoInvestorIds));
        await db
            .delete(investors)
            .where(inArray(investors.id, demoInvestorIds));
    }
    await db.delete(bonds).where(like(bonds.id, "demo-%"));

    await seedDemo();
    return jsonRes({ ok: true, message: "Demo reset complete" });
}

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return jsonRes({ error: "Method Not Allowed" }, 405);
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return jsonRes({ error: "Invalid JSON" }, 400);
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
        return jsonRes({ error: "Invalid request", details: parsed.error.flatten() }, 400);
    }

    try {
        if (parsed.data.action === "tick") return await tickDemo();
        if (parsed.data.action === "reset") return await resetDemo();
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return jsonRes({ error: message }, 500);
    }

    return jsonRes({ error: "Unknown action" }, 400);
}
