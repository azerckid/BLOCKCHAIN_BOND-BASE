/**
 * choonsim_projects에 bond_id 컬럼 추가 (앱과 동일한 DB 사용)
 * 실행: cd frontend && node scripts/add-bond-id-column.cjs
 * (TURSO_DATABASE_URL 사용 시 frontend/.env 또는 프로젝트 루트 .env에 설정)
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { createClient } = require("@libsql/client");

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function main() {
    try {
        await client.execute("ALTER TABLE choonsim_projects ADD COLUMN bond_id integer;");
        console.log("Added column bond_id to choonsim_projects.");
    } catch (e) {
        const msg = e.message || String(e);
        if (msg.includes("duplicate column") || msg.includes("already exists")) {
            console.log("Column bond_id already exists. Skip.");
        } else if (msg.includes("no such table")) {
            console.error("Table choonsim_projects not found. Run full schema migration first (e.g. drizzle-kit push).");
            process.exit(1);
        } else {
            throw e;
        }
    }
    try {
        await client.execute("CREATE UNIQUE INDEX choonsim_projects_bond_id_unique ON choonsim_projects (bond_id);");
        console.log("Created unique index on bond_id.");
    } catch (e) {
        const msg = e.message || String(e);
        if (msg.includes("already exists")) {
            console.log("Index already exists. Skip.");
        } else {
            throw e;
        }
    }
    console.log("Done.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
