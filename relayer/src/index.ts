import { ethers } from "ethers";
import { CONFIG, ABIS } from "./config.js";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Choonsim Bond ID registered on-chain via registerBond(101) */
const CHOONSIM_BOND_ID = 101;

/** Bond IDs to sync. Expandable for future bonds. */
const BOND_IDS = [CHOONSIM_BOND_ID];

/** Max consecutive failures before increasing backoff */
const MAX_BACKOFF_MULTIPLIER = 8;

/** Fallback RPC endpoints (tried in order when primary fails) */
const RPC_ENDPOINTS = [
    CONFIG.RPC_URL,
    "https://rpc.cc3-testnet.creditcoin.network", // duplicate as safety
];

// ─── Mock Fintech API (Simulation) ───────────────────────────────────────────

/**
 * MOCK FINTECH API SIMULATION
 * Simulates off-chain revenue data from ChoonSim AI-Talk subscription platform.
 * In production, this would fetch from the ChoonSim backend via api/revenue.
 */
class MockFintechAPI {
    private static bondData: Record<number, {
        principalPaid: number;
        interestPaid: number;
        status: number;
        proof: string;
        carbonReduced: number;
        jobsCreated: number;
        smeSupported: number;
        reportUrl: string;
    }> = {
            [CHOONSIM_BOND_ID]: {
                principalPaid: 25000,
                interestPaid: 3500,
                status: 0, // 0 = Active
                proof: "ipfs://QmChoonsimRevenue101",
                carbonReduced: 0,
                jobsCreated: 5,
                smeSupported: 1,
                reportUrl: "https://choonsim.ai/impact/bond-101"
            },
        };

    static async getAssetPerformance(bondId: number) {
        const data = this.bondData[bondId];
        if (!data) {
            throw new Error(`[MockAPI] No data for Bond #${bondId}`);
        }

        // Simulate periodic revenue growth (~30% chance per cycle)
        if (Math.random() > 0.7) {
            data.interestPaid += 250;
            data.principalPaid += 500;
            data.jobsCreated += 1;
            console.log(`[MockAPI] Revenue updated for Bond #${bondId}: Interest +250, Jobs +1`);
        }

        return { ...data }; // Return copy to avoid mutation issues
    }
}

// ─── Provider Management ─────────────────────────────────────────────────────

/**
 * Creates a JSON-RPC provider with automatic fallback.
 * Tries each endpoint until one responds.
 */
async function createHealthyProvider(): Promise<ethers.JsonRpcProvider> {
    for (const rpcUrl of RPC_ENDPOINTS) {
        try {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const blockNumber = await provider.getBlockNumber();
            console.log(`[Provider] Connected to ${rpcUrl} (block: ${blockNumber})`);
            return provider;
        } catch (err) {
            console.warn(`[Provider] Failed to connect to ${rpcUrl}:`, (err as Error).message);
        }
    }
    throw new Error("[Provider] All RPC endpoints unreachable.");
}

// ─── Main Loop (setTimeout Recursive Pattern) ────────────────────────────────

async function main() {
    console.log("--- Starting BondBase Relayer Bot (V3 / Choonsim) ---");
    console.log(`[Config] Bond IDs: [${BOND_IDS.join(", ")}]`);
    console.log(`[Config] Sync Interval: ${CONFIG.SYNC_INTERVAL_MS}ms`);

    if (!CONFIG.PRIVATE_KEY) {
        console.error("[FATAL] PRIVATE_KEY not found in .env");
        process.exit(1);
    }

    let provider = await createHealthyProvider();
    let wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
    let consecutiveFailures = 0;

    console.log(`[Wallet] Relayer Address: ${wallet.address}`);

    const runSync = async () => {
        const startTime = Date.now();
        console.log(`\n[${new Date().toISOString()}] ─── Sync Cycle Start ───`);

        let cycleSuccess = true;

        for (const bondId of BOND_IDS) {
            try {
                const oracleAdapter = new ethers.Contract(
                    CONFIG.ORACLE_ADAPTER_ADDRESS, ABIS.OracleAdapter, wallet
                ) as any;
                const mockUsdc = new ethers.Contract(
                    CONFIG.MOCK_USDC_ADDRESS, ABIS.MockUSDC, wallet
                ) as any;

                // 1. Fetch External Data (Simulation)
                const extData = await MockFintechAPI.getAssetPerformance(bondId);

                // 2. Fetch On-chain Data
                const onChain = await oracleAdapter.getAssetPerformance(bondId);

                // 3. Compare & Decide
                const extInterest = ethers.parseUnits(extData.interestPaid.toString(), 18);
                const onChainInterest = onChain.interestPaid;

                if (extInterest > onChainInterest) {
                    const delta = extInterest - onChainInterest;
                    console.log(`[Bond #${bondId}] Delta detected: ${ethers.formatUnits(delta, 18)} USDC`);

                    // 4. Check & Auto-Approve if needed
                    const allowance = await mockUsdc.allowance(wallet.address, CONFIG.ORACLE_ADAPTER_ADDRESS);
                    if (allowance < delta) {
                        console.log(`[Bond #${bondId}] Approving MockUSDC for OracleAdapter...`);
                        const approveTx = await mockUsdc.approve(
                            CONFIG.ORACLE_ADAPTER_ADDRESS,
                            ethers.MaxUint256
                        );
                        await approveTx.wait();
                        console.log(`[Bond #${bondId}] Approval confirmed.`);
                    }

                    // 5. Execute Update
                    const perfData = {
                        timestamp: Math.floor(Date.now() / 1000) - 60,
                        principalPaid: ethers.parseUnits(extData.principalPaid.toString(), 18),
                        interestPaid: extInterest,
                        status: extData.status,
                        verifyProof: extData.proof
                    };

                    const impactData = {
                        carbonReduced: extData.carbonReduced,
                        jobsCreated: extData.jobsCreated,
                        smeSupported: extData.smeSupported,
                        reportUrl: extData.reportUrl
                    };

                    console.log(`[Bond #${bondId}] Sending updateAssetStatus to OracleAdapter...`);
                    const tx = await oracleAdapter.updateAssetStatus(bondId, perfData, impactData);
                    const receipt = await tx.wait();
                    console.log(`[Bond #${bondId}] Sync OK. Tx: ${receipt.hash}`);
                } else {
                    console.log(`[Bond #${bondId}] No change. Already synchronized.`);
                }
            } catch (error) {
                cycleSuccess = false;
                const errMsg = error instanceof Error ? error.message : String(error);
                console.error(`[Bond #${bondId}] SYNC FAILED:`, errMsg);
            }
        }

        // ─── Backoff / Recovery Logic ────────────────────────────────────
        if (cycleSuccess) {
            consecutiveFailures = 0;
        } else {
            consecutiveFailures++;
            console.warn(`[Recovery] Consecutive failures: ${consecutiveFailures}`);

            // Re-establish provider on repeated failures
            if (consecutiveFailures >= 3) {
                console.warn("[Recovery] Attempting RPC reconnection...");
                try {
                    provider = await createHealthyProvider();
                    wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
                    console.log("[Recovery] RPC reconnected successfully.");
                } catch (reconnectErr) {
                    console.error("[Recovery] RPC reconnection failed:", (reconnectErr as Error).message);
                }
            }
        }

        const backoffMultiplier = Math.min(
            Math.pow(2, consecutiveFailures),
            MAX_BACKOFF_MULTIPLIER
        );
        const nextInterval = CONFIG.SYNC_INTERVAL_MS * backoffMultiplier;
        const elapsed = Date.now() - startTime;

        console.log(`[Cycle] Completed in ${elapsed}ms. Next in ${nextInterval / 1000}s (backoff x${backoffMultiplier})`);

        // Schedule next cycle (setTimeout recursive pattern avoids overlapping runs)
        setTimeout(runSync, nextInterval);
    };

    // Initial run
    await runSync();
}

main().catch((error) => {
    console.error("[FATAL] Relayer Critical Error:", error);
    process.exit(1);
});
