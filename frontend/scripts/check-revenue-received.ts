/**
 * BondBase가 춘심톡(bondbase-sync)에서 값을 제대로 받고 있는지 역으로 확인.
 * choonsim_revenue 최근 행 조회. source=CHOCO_CONSUMPTION 이면 춘심톡 연동으로 수신된 것.
 * 실행: cd frontend && npx tsx scripts/check-revenue-received.ts
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { desc } from "drizzle-orm";
import * as schema from "../app/db/schema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.development") });

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

const LIMIT = 30;

function formatTs(ms: number): string {
    return new Date(ms).toISOString();
}

async function main() {
    console.log("DB:", url.replace(/[\w-]+@[\w.-]+/, "***"));
    console.log("choonsim_revenue 최근", LIMIT, "건 (received_at 내림차순)\n");

    const rows = await db
        .select({
            id: schema.choonsimRevenue.id,
            projectId: schema.choonsimRevenue.projectId,
            source: schema.choonsimRevenue.source,
            amount: schema.choonsimRevenue.amount,
            receivedAt: schema.choonsimRevenue.receivedAt,
            description: schema.choonsimRevenue.description,
        })
        .from(schema.choonsimRevenue)
        .orderBy(desc(schema.choonsimRevenue.receivedAt))
        .limit(LIMIT);

    if (rows.length === 0) {
        console.log("(행 없음)");
        console.log("\n결론: 아직 revenue 수신 이력 없음. bondbase-sync 또는 POST /api/revenue 호출 후 다시 확인.");
        await client.close();
        return;
    }

    const fromChoonSim = rows.filter((r) => r.source === "CHOCO_CONSUMPTION");
    for (const r of rows) {
        const ts = r.receivedAt != null ? formatTs(r.receivedAt) : "-";
        const mark = r.source === "CHOCO_CONSUMPTION" ? " [춘심톡]" : "";
        console.log(`${r.id?.slice(0, 12)}... | ${r.projectId} | ${r.source} | amount=${r.amount} | ${ts}${mark}`);
        if (r.description) console.log(`    description: ${r.description.slice(0, 60)}${r.description.length > 60 ? "..." : ""}`);
    }

    console.log("\n---");
    console.log("총", rows.length, "건 중 source=CHOCO_CONSUMPTION(춘심톡 연동):", fromChoonSim.length, "건");
    if (fromChoonSim.length > 0) {
        console.log("결론: BondBase가 춘심톡 bondbase-sync에서 값을 제대로 받고 있음.");
    } else {
        console.log("결론: CHOCO_CONSUMPTION 수신 이력 없음. bondbase-sync 실행 여부·BONDBASE_API_URL·CHOONSIM_API_KEY 확인.");
    }
    await client.close();
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
