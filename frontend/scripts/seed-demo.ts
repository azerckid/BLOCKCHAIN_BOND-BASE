/**
 * Demo DB 시딩 스크립트 (최초 1회 또는 reset 시).
 * 실행: cd frontend && npx tsx scripts/seed-demo.ts
 * .env.development 로드 시 Turso 등 원격 DB 사용.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../app/db/schema.js";
import { DEMO_INVESTORS } from "../app/lib/demo-investors.js";
import { DateTime } from "luxon";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.development") });

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

const t = DateTime.now();

const DEMO_BONDS = [
    {
        id: "demo-bond-choonsim",
        bondId: 101,
        borrowerName: "ChoonSim AI-Talk",
        region: "KR",
        loanAmount: 500_000_000_000,
        interestRate: 1850,
        maturityDate: t.plus({ years: 2 }).toUnixInteger(),
        status: "ACTIVE" as const,
        createdAt: t.minus({ months: 6 }).toUnixInteger(),
        updatedAt: t.toUnixInteger(),
    },
    {
        id: "demo-bond-rina",
        bondId: 102,
        borrowerName: "Rina Virtual IP",
        region: "JP",
        loanAmount: 300_000_000_000,
        interestRate: 1650,
        maturityDate: t.plus({ years: 1, months: 6 }).toUnixInteger(),
        status: "ACTIVE" as const,
        createdAt: t.minus({ months: 4 }).toUnixInteger(),
        updatedAt: t.toUnixInteger(),
    },
];

const BOND_DB_IDS = ["demo-bond-choonsim", "demo-bond-rina"];
const INVESTMENT_AMOUNTS = [
    2_000_000_000, 3_500_000_000, 5_000_000_000, 7_000_000_000,
    8_500_000_000, 10_000_000_000, 12_500_000_000, 15_000_000_000,
    18_000_000_000, 20_000_000_000, 22_000_000_000, 25_000_000_000,
];
function makeSeedRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return Math.abs(s) / 0x100000000;
    };
}

async function seedDemo() {
    const rand = makeSeedRandom(42);

    console.log("▶ Seeding bonds...");
    for (const bond of DEMO_BONDS) {
        await db.insert(schema.bonds).values(bond).onConflictDoNothing();
    }
    console.log(`  ✔ ${DEMO_BONDS.length} bonds`);

    console.log("▶ Seeding investors...");
    for (const inv of DEMO_INVESTORS) {
        await db.insert(schema.investors).values({
            id: inv.id,
            userId: null,
            walletAddress: inv.walletAddress,
            kycStatus: "VERIFIED",
            autoReinvest: false,
            createdAt: t.minus({ days: Math.floor(rand() * 60) + 10 }).toUnixInteger(),
        }).onConflictDoNothing();
    }
    console.log(`  ✔ ${DEMO_INVESTORS.length} investors`);

    console.log("▶ Seeding investments...");
    type InsertInvestment = typeof schema.investments.$inferInsert;
    const investmentList: InsertInvestment[] = [];
    let invSeq = 0;

    for (let i = 0; i < DEMO_INVESTORS.length; i++) {
        const investor = DEMO_INVESTORS[i];
        const hasTwoBonds = i % 2 === 0;
        const bondIds = hasTwoBonds
            ? BOND_DB_IDS
            : [BOND_DB_IDS[Math.floor(rand() * BOND_DB_IDS.length)]];

        for (const bondDbId of bondIds) {
            const usdcAmount = INVESTMENT_AMOUNTS[Math.floor(rand() * INVESTMENT_AMOUNTS.length)];
            const tokenAmount = Math.floor(usdcAmount / 1_000_000);
            invSeq++;
            investmentList.push({
                id: `demo-investment-${String(invSeq).padStart(3, "0")}`,
                investorId: investor.id,
                bondId: bondDbId,
                tokenAmount,
                usdcAmount,
                transactionHash: `0xDEMOTX${String(invSeq).padStart(10, "0")}AABBCCDDEE`,
                createdAt: t.minus({ days: Math.floor(rand() * 50) + 5 }).toUnixInteger(),
            });
        }
    }

    for (const inv of investmentList) {
        await db.insert(schema.investments).values(inv).onConflictDoNothing();
    }
    console.log(`  ✔ ${investmentList.length} investments`);
    console.log("✅ Demo seeding complete (bonds, investors, investments only).");
}

await seedDemo();
await client.close();
