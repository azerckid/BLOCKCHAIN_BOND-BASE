/**
 * Turso 등 원격 DB에 choonsim 관련 마이그레이션(bond_id, demo_yield_distributed_at) 적용.
 * drizzle-kit push 없이 수동 적용할 때 사용.
 * 실행: cd frontend && npx tsx scripts/apply-choonsim-migrations.ts
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.development") });

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });

async function main() {
    console.log("DB:", url.replace(/[\w-]+@[\w.-]+/, "***"));

    try {
        await client.execute("ALTER TABLE choonsim_projects ADD COLUMN bond_id integer");
        console.log("  Applied: choonsim_projects.bond_id");
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("duplicate column") || msg.includes("already exists")) {
            console.log("  Skip: choonsim_projects.bond_id already exists");
        } else throw e;
    }

    try {
        await client.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS choonsim_projects_bond_id_unique ON choonsim_projects (bond_id)"
        );
        console.log("  Applied: index choonsim_projects_bond_id_unique");
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("already exists")) {
            console.log("  Skip: index already exists");
        } else throw e;
    }

    try {
        await client.execute("ALTER TABLE choonsim_revenue ADD COLUMN demo_yield_distributed_at integer");
        console.log("  Applied: choonsim_revenue.demo_yield_distributed_at");
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("duplicate column") || msg.includes("already exists")) {
            console.log("  Skip: choonsim_revenue.demo_yield_distributed_at already exists");
        } else throw e;
    }

    await client.close();
    console.log("Done.");
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
