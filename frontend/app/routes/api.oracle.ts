import type { LoaderFunctionArgs } from "react-router";
import { db } from "@/db";
import { choonsimRevenue } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { creditcoinTestnet } from "@/config/wagmi";
import { CONTRACTS } from "@/config/contracts";

const CHOONSIM_BOND_ID = 101n;
const YIELD_DISTRIBUTOR_ADDRESS = CONTRACTS.YieldDistributor.address as `0x${string}`;
const MOCK_USDC_ADDRESS = CONTRACTS.MockUSDC.address as `0x${string}`;

// Helper to get environment variables
function getEnv(key: string): string | undefined {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
}

const PRIVATE_KEY = getEnv('RELAYER_PRIVATE_KEY');
if (!PRIVATE_KEY) {
    throw new Error('RELAYER_PRIVATE_KEY is required');
}

// ABI for YieldDistributor
const DISTRIBUTOR_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "bondId", "type": "uint256" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "depositYield",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "bondId", "type": "uint256" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "verifyYield",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// ABI for MockUSDC
const USDC_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

/**
 * Oracle API Route - Processes pending revenue and executes on-chain transactions
 * Called by Vercel Cron Jobs every 2 minutes
 */
export async function loader({ request }: LoaderFunctionArgs) {
    // Log incoming request for debugging
    console.log(`[Oracle API] Request received: ${request.method} ${new URL(request.url).pathname}`);
    console.log(`[Oracle API] Headers:`, Object.fromEntries(request.headers.entries()));

    // Verify this is a cron job request (from Vercel Cron Jobs or external cron service)
    const authHeader = request.headers.get("authorization");
    const cronSecret = getEnv("CRON_SECRET");
    
    // Check for external cron service header (cron-job.org uses User-Agent)
    const userAgent = request.headers.get("user-agent") || "";
    const isExternalCron = userAgent.includes("cron-job.org") || userAgent.includes("Cronitor") || userAgent.includes("EasyCron");

    // Allow external cron services with CRON_SECRET or Vercel Cron Jobs
    if (cronSecret) {
        if (isExternalCron) {
            // External cron service: require CRON_SECRET in Authorization header
            if (authHeader !== `Bearer ${cronSecret}`) {
                console.log(`[Oracle API] Unauthorized external cron: Expected Bearer token`);
                return new Response("Unauthorized", { status: 401 });
            }
        } else {
            // Vercel Cron Jobs: require CRON_SECRET
            if (authHeader !== `Bearer ${cronSecret}`) {
                console.log(`[Oracle API] Unauthorized: Expected Bearer token but got: ${authHeader?.substring(0, 20)}...`);
                return new Response("Unauthorized", { status: 401 });
            }
        }
    }

    try {
        // Setup blockchain clients
        const account = privateKeyToAccount(
            PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY as `0x${string}` : `0x${PRIVATE_KEY}` as `0x${string}`
        );

        const publicClient = createPublicClient({
            chain: creditcoinTestnet,
            transport: http(),
        });

        const walletClient = createWalletClient({
            account,
            chain: creditcoinTestnet,
            transport: http(),
        });

        // 1. Fetch Pending Revenue (on_chain_tx_hash IS NULL)
        const pendingRevenues = await db.select()
            .from(choonsimRevenue)
            .where(sql`${choonsimRevenue.onChainTxHash} IS NULL`)
            .limit(1);

        if (pendingRevenues.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: "No pending revenue to process"
            }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        const revenue = pendingRevenues[0];
        const amountVal = Number(revenue.amount);
        const amountWei = parseUnits(amountVal.toString(), 18);

        console.log(`[Oracle API] Found Pending Revenue: ${amountVal} USDC (ID: ${revenue.id})`);

        // 2. Mark as processing to prevent duplicate processing
        const tempHash = `processing_${Date.now()}_${revenue.id}`;
        await db.update(choonsimRevenue)
            .set({ onChainTxHash: tempHash })
            .where(eq(choonsimRevenue.id, revenue.id));

        // 3. Ensure Approval (Relayer -> Distributor)
        const allowance = await publicClient.readContract({
            address: MOCK_USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: 'allowance',
            args: [account.address, YIELD_DISTRIBUTOR_ADDRESS]
        }) as bigint;

        if (allowance < amountWei) {
            console.log("[Oracle API] Approving USDC...");
            const approveHash = await walletClient.writeContract({
                address: MOCK_USDC_ADDRESS,
                abi: USDC_ABI,
                functionName: 'approve',
                args: [YIELD_DISTRIBUTOR_ADDRESS, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")]
            });
            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            console.log("[Oracle API] Approval confirmed.");
        }

        // 4. Execute Deposit Yield
        console.log(`[Oracle API] Sending depositYield transaction...`);
        const depositTxHash = await walletClient.writeContract({
            address: YIELD_DISTRIBUTOR_ADDRESS,
            abi: DISTRIBUTOR_ABI,
            functionName: 'depositYield',
            args: [CHOONSIM_BOND_ID, amountWei]
        });

        // 5. Update DB immediately with depositTxHash to prevent duplicate processing
        console.log(`[Oracle API] Updating DB with depositTxHash: ${depositTxHash}`);
        await db.update(choonsimRevenue)
            .set({ onChainTxHash: depositTxHash })
            .where(eq(choonsimRevenue.id, revenue.id));

        console.log(`[Oracle API] Waiting for depositYield confirmation: ${depositTxHash}`);
        await publicClient.waitForTransactionReceipt({ hash: depositTxHash });

        // 6. Verify Yield (Release from pending to active distribution)
        console.log(`[Oracle API] Verifying yield to release from pending...`);
        const verifyTxHash = await walletClient.writeContract({
            address: YIELD_DISTRIBUTOR_ADDRESS,
            abi: DISTRIBUTOR_ABI,
            functionName: 'verifyYield',
            args: [CHOONSIM_BOND_ID, amountWei]
        });

        console.log(`[Oracle API] Waiting for verifyYield confirmation: ${verifyTxHash}`);
        await publicClient.waitForTransactionReceipt({ hash: verifyTxHash });

        console.log(`[Oracle API] Process Complete! Yield deposited and verified.`);

        return new Response(JSON.stringify({
            success: true,
            message: "Revenue processed successfully",
            revenueId: revenue.id,
            depositTxHash,
            verifyTxHash
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("[Oracle API] Error:", error);

        // On error, reset the hash to allow retry (only if it's a processing hash)
        // Try to find the revenue that was being processed
        try {
            const pendingRevenues = await db.select()
                .from(choonsimRevenue)
                .where(sql`${choonsimRevenue.onChainTxHash} LIKE 'processing_%'`)
                .limit(1);

            if (pendingRevenues.length > 0) {
                const revenue = pendingRevenues[0];
                if (revenue.onChainTxHash?.startsWith('processing_')) {
                    await db.update(choonsimRevenue)
                        .set({ onChainTxHash: null })
                        .where(eq(choonsimRevenue.id, revenue.id));
                    console.log(`[Oracle API] Reset processing flag for revenue ID: ${revenue.id}`);
                }
            }
        } catch (resetError) {
            console.error("[Oracle API] Failed to reset processing flag:", resetError);
        }

        return new Response(JSON.stringify({
            success: false,
            error: error?.message || "Internal Server Error"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
