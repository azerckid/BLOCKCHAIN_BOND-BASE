/**
 * tick에서 쓰는 쿼리만 실행해 DB/컬럼 이슈 확인.
 * 실행: cd frontend && npx tsx scripts/check-demo-tick-query.ts
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, isNull } from "drizzle-orm";
import * as schema from "../app/db/schema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.development") });

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

async function main() {
    console.log("DB:", url.replace(/[\w-]+@[\w.-]+/, "***"));
    const rows = await db
        .select({
            revenueId: schema.choonsimRevenue.id,
            amount: schema.choonsimRevenue.amount,
            bondIdOnChain: schema.choonsimProjects.bondId,
        })
        .from(schema.choonsimRevenue)
        .innerJoin(schema.choonsimProjects, eq(schema.choonsimRevenue.projectId, schema.choonsimProjects.id))
        .where(isNull(schema.choonsimRevenue.demoYieldDistributedAt))
        .limit(1);
    console.log("Rows:", rows.length, rows);
    await client.close();
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
