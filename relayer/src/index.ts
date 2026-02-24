import { ethers } from "ethers";
import { CONFIG, ABIS } from "./config.js";
import { MockFintechAPI, CHOONSIM_BOND_ID, RINA_BOND_ID } from "./mock-fintech-api.js";
import { logger } from "./utils/logger.js";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Bond IDs to sync (춘심 101, Rina 102). */
const BOND_IDS = [CHOONSIM_BOND_ID, RINA_BOND_ID];

/** Max consecutive failures before increasing backoff */
const MAX_BACKOFF_MULTIPLIER = 8;

/** Fallback RPC endpoints (tried in order when primary fails) */
const RPC_ENDPOINTS = [
    CONFIG.RPC_URL,
    "https://rpc.cc3-testnet.creditcoin.network", // duplicate as safety
];

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
            logger.info(`[Provider] Connected to ${rpcUrl} (block: ${blockNumber})`);
            return provider;
        } catch (err) {
            logger.warn(`[Provider] Failed to connect to ${rpcUrl}: ${(err as Error).message}`);
        }
    }
    throw new Error("[Provider] All RPC endpoints unreachable.");
}

// ─── Main Loop (setTimeout Recursive Pattern) ────────────────────────────────

async function main() {
    logger.info("--- Starting BondBase Relayer Bot (V3 / Choonsim) ---");
    logger.info(`[Config] Bond IDs: [${BOND_IDS.join(", ")}]`);
    logger.info(`[Config] Sync Interval: ${CONFIG.SYNC_INTERVAL_MS}ms`);

    if (!CONFIG.PRIVATE_KEY) {
        logger.error("[FATAL] PRIVATE_KEY not found in .env");
        process.exit(1);
    }

    let provider = await createHealthyProvider();
    let wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
    let consecutiveFailures = 0;

    logger.info(`[Wallet] Relayer Address: ${wallet.address}`);

    const runSync = async () => {
        const startTime = Date.now();
        // Timestamp is automatically handled by pino
        logger.info(`─── Sync Cycle Start ───`);

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
                    logger.info(`[Bond #${bondId}] Delta detected: ${ethers.formatUnits(delta, 18)} USDC`);

                    // 4. Check & Auto-Approve if needed
                    const allowance = await mockUsdc.allowance(wallet.address, CONFIG.ORACLE_ADAPTER_ADDRESS);
                    if (allowance < delta) {
                        logger.info(`[Bond #${bondId}] Approving MockUSDC for OracleAdapter...`);
                        const approveTx = await mockUsdc.approve(
                            CONFIG.ORACLE_ADAPTER_ADDRESS,
                            ethers.MaxUint256
                        );
                        await approveTx.wait();
                        logger.info(`[Bond #${bondId}] Approval confirmed.`);
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

                    logger.info(`[Bond #${bondId}] Sending updateAssetStatus to OracleAdapter...`);
                    const tx = await oracleAdapter.updateAssetStatus(bondId, perfData, impactData);
                    const receipt = await tx.wait();
                    logger.info(`[Bond #${bondId}] Sync OK. Tx: ${receipt.hash}`);
                } else {
                    logger.debug(`[Bond #${bondId}] No change. Already synchronized.`);
                }
            } catch (error) {
                cycleSuccess = false;
                // Pino error serialization
                logger.error({ err: error, bondId }, "SYNC FAILED");
            }
        }

        // ─── Backoff / Recovery Logic ────────────────────────────────────
        if (cycleSuccess) {
            consecutiveFailures = 0;
        } else {
            consecutiveFailures++;
            logger.warn(`[Recovery] Consecutive failures: ${consecutiveFailures}`);

            // Re-establish provider on repeated failures
            if (consecutiveFailures >= 3) {
                logger.warn("[Recovery] Attempting RPC reconnection...");
                try {
                    provider = await createHealthyProvider();
                    wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
                    logger.info("[Recovery] RPC reconnected successfully.");
                } catch (reconnectErr) {
                    logger.error({ err: reconnectErr }, "[Recovery] RPC reconnection failed");
                }
            }
        }

        const backoffMultiplier = Math.min(
            Math.pow(2, consecutiveFailures),
            MAX_BACKOFF_MULTIPLIER
        );
        const nextInterval = CONFIG.SYNC_INTERVAL_MS * backoffMultiplier;
        const elapsed = Date.now() - startTime;

        logger.info(`[Cycle] Completed in ${elapsed}ms. Next in ${nextInterval / 1000}s (backoff x${backoffMultiplier})`);

        // Schedule next cycle (setTimeout recursive pattern avoids overlapping runs)
        setTimeout(runSync, nextInterval);
    };

    // Initial run
    await runSync();
}

main().catch((error) => {
    logger.fatal({ err: error }, "[FATAL] Relayer Critical Error");
    process.exit(1);
});
