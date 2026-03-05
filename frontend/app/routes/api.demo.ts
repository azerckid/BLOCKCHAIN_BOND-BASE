/**
 * POST /api/demo
 * Body: { action: "tick" } | { action: "reset" }
 *
 * tick  — 미분배 choonsim_revenue 1건을 bond 투자 비율로 yield 분배 후 반환 (revenue 기반, 고정 APR 아님)
 * reset — demo- prefix 데이터 삭제 후 재시딩
 */
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { db } from "@/db";
import {
    yieldDistributions,
    investments,
    investors,
    bonds,
    choonsimRevenue,
    choonsimProjects,
} from "@/db/schema";
import { eq, like, inArray, isNull } from "drizzle-orm";
import { DateTime } from "luxon";
import { DEMO_INVESTORS, ID_TO_NAME } from "@/lib/demo-investors";
import { seedDemo } from "@/lib/demo-seed.server";

const bodySchema = z.discriminatedUnion("action", [
    z.object({ action: z.literal("tick") }),
    z.object({ action: z.literal("reset") }),
]);

/** 온체인 bondId(101/102) → 데모 bond DB id */
const ONCHAIN_BOND_TO_DB_ID: Record<number, string> = {
    101: "demo-bond-choonsim",
    102: "demo-bond-rina",
};

function jsonRes(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function tickDemo() {
    const ts = DateTime.now().toUnixInteger();

    const rows = await db
        .select({
            revenueId: choonsimRevenue.id,
            amount: choonsimRevenue.amount,
            bondIdOnChain: choonsimProjects.bondId,
        })
        .from(choonsimRevenue)
        .innerJoin(choonsimProjects, eq(choonsimRevenue.projectId, choonsimProjects.id))
        .where(isNull(choonsimRevenue.demoYieldDistributedAt))
        .limit(1);

    if (rows.length === 0) {
        return jsonRes({ error: "no undistributed revenue — add choonsim_revenue or run bondbase-sync" }, 404);
    }

    const { revenueId, amount: revenueAmount, bondIdOnChain } = rows[0];
    const bondDbId = bondIdOnChain != null ? ONCHAIN_BOND_TO_DB_ID[bondIdOnChain] : null;
    if (!bondDbId) {
        await db
            .update(choonsimRevenue)
            .set({ demoYieldDistributedAt: ts })
            .where(eq(choonsimRevenue.id, revenueId));
        return jsonRes({ error: "revenue project has no demo bond (101/102)" }, 400);
    }

    const demoIds = new Set(DEMO_INVESTORS.map((i) => i.id));
    const invRowsAll = await db
        .select({ investorId: investments.investorId, usdcAmount: investments.usdcAmount })
        .from(investments)
        .where(eq(investments.bondId, bondDbId));
    const invRows = invRowsAll.filter((r) => demoIds.has(r.investorId));

    const totalUsdc = invRows.reduce((sum, r) => sum + r.usdcAmount, 0);
    if (totalUsdc === 0) {
        await db
            .update(choonsimRevenue)
            .set({ demoYieldDistributedAt: ts })
            .where(eq(choonsimRevenue.id, revenueId));
        return jsonRes({
            ok: true,
            revenueId,
            bondId: bondDbId,
            distributed: 0,
            message: "revenue marked distributed; no demo investments for this bond",
        });
    }

    const inserted: { investorId: string; yieldAmount: number }[] = [];
    for (const inv of invRows) {
        const yieldAmount = Math.floor((revenueAmount * inv.usdcAmount) / totalUsdc);
        if (yieldAmount <= 0) continue;
        await db.insert(yieldDistributions).values({
            id: `demo-yield-${revenueId}-${inv.investorId}-${crypto.randomUUID().slice(0, 8)}`,
            bondId: bondDbId,
            investorId: inv.investorId,
            yieldAmount,
            transactionHash: null,
            distributedAt: ts,
        });
        inserted.push({ investorId: inv.investorId, yieldAmount });
    }

    await db
        .update(choonsimRevenue)
        .set({ demoYieldDistributedAt: ts })
        .where(eq(choonsimRevenue.id, revenueId));

    return jsonRes({
        ok: true,
        revenueId,
        bondId: bondDbId,
        revenueAmount,
        totalUsdc,
        distributed: inserted.length,
        yields: inserted,
        timestamp: DateTime.fromSeconds(ts).toISO(),
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
