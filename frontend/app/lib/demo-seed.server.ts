/**
 * Demo DB 시딩 로직. api.demo.ts(reset)와 scripts/seed-demo.ts에서 공유.
 * 서버 전용 (DB 접근).
 */
import { db } from "@/db";
import * as schema from "@/db/schema";
import { DEMO_INVESTORS } from "@/lib/demo-investors";
import { DateTime } from "luxon";

const now = () => DateTime.now();

const DEMO_BONDS = [
    {
        id: "demo-bond-choonsim",
        bondId: 101,
        borrowerName: "ChoonSim AI-Talk",
        region: "KR",
        loanAmount: 500_000_000_000,
        interestRate: 1850,
        maturityDate: now().plus({ years: 2 }).toUnixInteger(),
        status: "ACTIVE" as const,
        createdAt: now().minus({ months: 6 }).toUnixInteger(),
        updatedAt: now().toUnixInteger(),
    },
    {
        id: "demo-bond-rina",
        bondId: 102,
        borrowerName: "Rina Virtual IP",
        region: "JP",
        loanAmount: 300_000_000_000,
        interestRate: 1650,
        maturityDate: now().plus({ years: 1, months: 6 }).toUnixInteger(),
        status: "ACTIVE" as const,
        createdAt: now().minus({ months: 4 }).toUnixInteger(),
        updatedAt: now().toUnixInteger(),
    },
];

const BOND_DB_IDS = ["demo-bond-choonsim", "demo-bond-rina"];

const INVESTMENT_AMOUNTS = [
    2_000_000_000, 3_500_000_000, 5_000_000_000, 7_000_000_000,
    8_500_000_000, 10_000_000_000, 12_500_000_000, 15_000_000_000,
    18_000_000_000, 20_000_000_000, 22_000_000_000, 25_000_000_000,
];

/** LCG seeded pseudo-random — deterministic so re-seeding produces same data */
function makeSeedRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return Math.abs(s) / 0x100000000;
    };
}

export async function seedDemo() {
    const t = now();
    const rand = makeSeedRandom(42);

    // 1. Bonds
    for (const bond of DEMO_BONDS) {
        await db.insert(schema.bonds).values(bond).onConflictDoNothing();
    }

    // 2. Investors
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

    // 3. Investments
    type InsertInvestment = typeof schema.investments.$inferInsert;
    const investments: InsertInvestment[] = [];
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
            investments.push({
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

    for (const inv of investments) {
        await db.insert(schema.investments).values(inv).onConflictDoNothing();
    }
}
