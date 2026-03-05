/**
 * 데모 20명 투자자의 실제 온체인 approve + purchaseBond 실행 후 DB에 tx hash 저장.
 * 사전: npm run generate-demo-wallets (또는 npx tsx scripts/generate-demo-wallets.ts),
 *       20명 주소에 CTC(가스) 및 MockUSDC 잔액 보충.
 * 실행: cd frontend && npx tsx scripts/seed-demo-onchain.ts
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { CONTRACTS } from "@bond-base/types";
import * as schema from "../app/db/schema.js";
import { DEMO_INVESTORS } from "../app/lib/demo-investors.js";
import { DateTime } from "luxon";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.development") });
loadEnv({ path: join(__dirname, "..", ".env.demo.local") });

const RPC = process.env.CREDITCOIN_TESTNET_RPC ?? "https://rpc.cc3-testnet.creditcoin.network";
const chain = {
    id: 102031,
    name: "Creditcoin Testnet",
    nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
    rpcUrls: { default: { http: [RPC] } },
} as const;

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

/** 6 decimals (DB) → 18 decimals (contract) */
function toWei(usdcAmount: number): bigint {
    return BigInt(usdcAmount) * BigInt(1e12);
}

function getDemoPrivateKey(index: number): string | undefined {
    const key = `DEMO_INV_${String(index).padStart(2, "0")}_PRIVATE_KEY`;
    return process.env[key];
}

async function main() {
    const rand = makeSeedRandom(42);
    const publicClient = createPublicClient({
        chain,
        transport: http(RPC),
    });

    // 1. DB: bonds + investors
    console.log("Seeding bonds...");
    for (const bond of DEMO_BONDS) {
        await db.insert(schema.bonds).values(bond).onConflictDoNothing();
    }
    console.log("Seeding investors...");
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

    const poolAddress = CONTRACTS.LiquidityPool.address as `0x${string}`;
    const usdcAddress = CONTRACTS.MockUSDC.address as `0x${string}`;

    type InvestmentRow = { bondDbId: string; usdcAmount: number; investorId: string; investorIndex: number };
    const planned: InvestmentRow[] = [];
    for (let i = 0; i < DEMO_INVESTORS.length; i++) {
        const investor = DEMO_INVESTORS[i];
        const hasTwoBonds = i % 2 === 0;
        const bondIds = hasTwoBonds
            ? BOND_DB_IDS
            : [BOND_DB_IDS[Math.floor(rand() * BOND_DB_IDS.length)]];
        for (const bondDbId of bondIds) {
            const usdcAmount = INVESTMENT_AMOUNTS[Math.floor(rand() * INVESTMENT_AMOUNTS.length)];
            planned.push({ bondDbId, usdcAmount, investorId: investor.id, investorIndex: i });
        }
    }

    let invSeq = 0;
    const investmentRows: (typeof schema.investments.$inferInsert)[] = [];

    for (const { bondDbId, usdcAmount, investorId, investorIndex } of planned) {
        invSeq++;
        const pk = getDemoPrivateKey(investorIndex + 1);
        if (!pk) {
            console.warn(`No DEMO_INV_${String(investorIndex + 1).padStart(2, "0")}_PRIVATE_KEY; skipping on-chain, inserting placeholder tx hash.`);
            investmentRows.push({
                id: `demo-investment-${String(invSeq).padStart(3, "0")}`,
                investorId,
                bondId: bondDbId,
                tokenAmount: Math.floor(usdcAmount / 1_000_000),
                usdcAmount,
                transactionHash: `0xDEMOTX${String(invSeq).padStart(10, "0")}AABBCCDDEE`,
                createdAt: t.minus({ days: Math.floor(rand() * 50) + 5 }).toUnixInteger(),
            });
            continue;
        }

        const account = privateKeyToAccount(pk as `0x${string}`);
        const walletClient = createWalletClient({
            account,
            chain,
            transport: http(RPC),
        });
        const onChainBondId = bondDbId === "demo-bond-choonsim" ? 101 : 102;
        const amountWei = toWei(usdcAmount);

        try {
            const hashApprove = await walletClient.writeContract({
                address: usdcAddress,
                abi: CONTRACTS.MockUSDC.abi,
                functionName: "approve",
                args: [poolAddress, amountWei],
                account,
            });
            await publicClient.waitForTransactionReceipt({ hash: hashApprove });
            const hashPurchase = await walletClient.writeContract({
                address: poolAddress,
                abi: CONTRACTS.LiquidityPool.abi,
                functionName: "purchaseBond",
                args: [BigInt(onChainBondId), amountWei],
                account,
            });
            const receipt = await publicClient.waitForTransactionReceipt({ hash: hashPurchase });
            investmentRows.push({
                id: `demo-investment-${String(invSeq).padStart(3, "0")}`,
                investorId,
                bondId: bondDbId,
                tokenAmount: Math.floor(usdcAmount / 1_000_000),
                usdcAmount,
                transactionHash: receipt.transactionHash,
                createdAt: t.minus({ days: Math.floor(rand() * 50) + 5 }).toUnixInteger(),
            });
            console.log(`  inv ${invSeq}: ${receipt.transactionHash}`);
        } catch (err) {
            console.error(`  inv ${invSeq} failed:`, err);
            investmentRows.push({
                id: `demo-investment-${String(invSeq).padStart(3, "0")}`,
                investorId,
                bondId: bondDbId,
                tokenAmount: Math.floor(usdcAmount / 1_000_000),
                usdcAmount,
                transactionHash: `0xFAILED${String(invSeq).padStart(10, "0")}`,
                createdAt: t.minus({ days: Math.floor(rand() * 50) + 5 }).toUnixInteger(),
            });
        }
    }

    console.log("Inserting investments...");
    for (const row of investmentRows) {
        await db.insert(schema.investments).values(row).onConflictDoNothing();
    }
    console.log("Done. Investments:", investmentRows.length);
    await client.close();
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
