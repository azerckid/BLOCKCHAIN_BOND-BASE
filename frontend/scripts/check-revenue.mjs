import { createClient } from "@libsql/client";
import { config } from "dotenv";
config();

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });

// 1. choonsimRevenue 총 건수
const total = await client.execute("SELECT COUNT(*) as cnt FROM choonsim_revenue");
console.log("choonsimRevenue 총 건수:", total.rows[0].cnt);

// 2. 일별 합산
const daily = await client.execute(`
  SELECT
    date(received_at, 'unixepoch') as day,
    project_id,
    SUM(amount) as daily_amount,
    COUNT(*) as cnt,
    source
  FROM choonsim_revenue
  GROUP BY day, project_id
  ORDER BY day DESC
  LIMIT 40
`);
console.log("\n일별 revenue (최근 40건):");
if (daily.rows.length === 0) console.log("  데이터 없음");
else daily.rows.forEach(r => console.log(" ", r));

// 3. choonsimProjects
const projects = await client.execute("SELECT id, name, bond_id, updated_at FROM choonsim_projects");
console.log("\nchoonsimProjects:");
projects.rows.forEach(r => console.log(" ", r));

// 4. 전체 amount 합산
const sum = await client.execute(`
  SELECT project_id, SUM(amount) as total_amount, MIN(received_at) as first, MAX(received_at) as last
  FROM choonsim_revenue GROUP BY project_id
`);
console.log("\n프로젝트별 총 revenue:");
if (sum.rows.length === 0) console.log("  데이터 없음");
else sum.rows.forEach(r => console.log(" ", r));

await client.close();
