/**
 * 데모 tick 테스트용: choonsim_revenue에 미분배(demo_yield_distributed_at = null) 1~2건 삽입.
 * 실행: cd frontend && npx tsx scripts/seed-demo-revenue.ts
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../app/db/schema.js";
import { randomUUID } from "node:crypto";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.development") });
if (process.env.DEMO_USE_LOCAL_DB === "1") {
    process.env.TURSO_DATABASE_URL = "file:local.db";
    process.env.TURSO_AUTH_TOKEN = "";
}

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

const now = Math.floor(Date.now() / 1000);

async function main() {
    try {
        await client.execute("ALTER TABLE choonsim_revenue ADD COLUMN demo_yield_distributed_at integer");
        console.log("Applied migration: demo_yield_distributed_at column.");
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes("duplicate column") && !msg.includes("already exists")) throw e;
    }

    await db.insert(schema.choonsimRevenue).values({
        id: `demo-revenue-${randomUUID().slice(0, 8)}`,
        projectId: "choonsim-main",
        amount: 10_000_000, // 10 USDC (6 decimals)
        source: "SUBSCRIPTION",
        description: "Demo tick test",
        receivedAt: now,
        onChainTxHash: null,
        demoYieldDistributedAt: null,
    }).onConflictDoNothing();

    await db.insert(schema.choonsimRevenue).values({
        id: `demo-revenue-${randomUUID().slice(0, 8)}`,
        projectId: "choonsim-main",
        amount: 5_000_000, // 5 USDC
        source: "CHOCO_CONSUMPTION",
        description: "Demo tick test 2",
        receivedAt: now - 60,
        onChainTxHash: null,
        demoYieldDistributedAt: null,
    }).onConflictDoNothing();

    console.log("Inserted 2 demo revenue rows (choonsim-main, demo_yield_distributed_at = null).");
    await client.close();
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
