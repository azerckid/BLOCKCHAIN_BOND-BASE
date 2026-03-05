/**
 * choonsim_projects의 bond_id가 null인 행을 101(춘심)/102(리나)로 설정.
 * 데모 tick에서 revenue → bond 매핑에 필요.
 * 실행: cd frontend && npx tsx scripts/update-choonsim-bond-ids.ts
 */
import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../app/db/schema.js";
import { eq, isNull } from "drizzle-orm";

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

const UPDATES: { id: string; bondId: number }[] = [
    { id: "choonsim-main", bondId: 101 },
    { id: "bond-102", bondId: 102 },
];

async function main() {
    for (const { id, bondId } of UPDATES) {
        const rows = await db
            .select({ bondId: schema.choonsimProjects.bondId })
            .from(schema.choonsimProjects)
            .where(eq(schema.choonsimProjects.id, id))
            .limit(1);
        if (rows.length === 0) {
            console.log(`  Skip ${id}: no row`);
            continue;
        }
        if (rows[0].bondId != null) {
            console.log(`  Skip ${id}: bond_id already ${rows[0].bondId}`);
            continue;
        }
        await db
            .update(schema.choonsimProjects)
            .set({ bondId, updatedAt: Date.now() })
            .where(eq(schema.choonsimProjects.id, id));
        console.log(`  Updated ${id} -> bond_id = ${bondId}`);
    }
    const nullCount = await db
        .select()
        .from(schema.choonsimProjects)
        .where(isNull(schema.choonsimProjects.bondId));
    console.log("Rows still with null bond_id:", nullCount.length);
    await client.close();
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
