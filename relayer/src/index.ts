import { ethers } from "ethers";
import { CONFIG, ABIS } from "./config";

/**
 * MOCK FINTECH API SIMULATION
 * In a real-world scenario, this would fetch data from an external 
 * lending partner's database or API.
 */
class MockFintechAPI {
    private static bondData: Record<number, any> = {
        1: { principalPaid: 50000, interestPaid: 12000, status: 0, proof: "ipfs://QmMockData1" },
        2: { principalPaid: 10000, interestPaid: 2500, status: 0, proof: "ipfs://QmMockData2" },
    };

    static async getAssetPerformance(bondId: number) {
        // Simulate minor updates periodically
        if (Math.random() > 0.7) {
            this.bondData[bondId].interestPaid += 500;
            this.bondData[bondId].principalPaid += 1000;
            console.log(`[API] Mock Data Updated for Bond #${bondId}: Interest +500`);
        }
        return this.bondData[bondId];
    }
}

async function main() {
    console.log("--- Starting BuildCTC Relayer Bot ---");

    if (!CONFIG.PRIVATE_KEY) {
        console.error("Error: PRIVATE_KEY not found in .env");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

    const oracleAdapter = new ethers.Contract(CONFIG.ORACLE_ADAPTER_ADDRESS, ABIS.OracleAdapter, wallet) as any;
    const mockUsdc = new ethers.Contract(CONFIG.MOCK_USDC_ADDRESS, ABIS.MockUSDC, wallet) as any;

    console.log(`Relayer Address: ${wallet.address}`);

    const runSync = async () => {
        console.log(`\n[${new Date().toLocaleTimeString()}] Starting Sync Cycle...`);

        // We sync Bond #1 and #2 for this demo
        const bondIds = [1, 2];

        for (const bondId of bondIds) {
            try {
                // 1. Fetch External Data (Simulation)
                const extData = await MockFintechAPI.getAssetPerformance(bondId);

                // 2. Fetch On-chain Data
                const onChain = await oracleAdapter.getAssetPerformance(bondId);

                // 3. Compare & Decide
                const extInterest = ethers.parseUnits(extData.interestPaid.toString(), 18);
                const onChainInterest = onChain.interestPaid;

                if (extInterest > onChainInterest) {
                    const delta = extInterest - onChainInterest;
                    console.log(`[Bond #${bondId}] New Interest detected! Delta: ${ethers.formatUnits(delta, 18)} USDC`);

                    // 4. Check Allowance for the Delta
                    const allowance = await mockUsdc.allowance(wallet.address, CONFIG.ORACLE_ADAPTER_ADDRESS);
                    if (allowance < delta) {
                        console.log(`[Bond #${bondId}] Approving ${ethers.formatUnits(delta, 18)} USDC...`);
                        const approveTx = await mockUsdc.approve(CONFIG.ORACLE_ADAPTER_ADDRESS, delta);
                        await approveTx.wait();
                        console.log(`[Bond #${bondId}] Approved!`);
                    }

                    // 5. Execute Update
                    const updateData = {
                        timestamp: Math.floor(Date.now() / 1000),
                        principalPaid: ethers.parseUnits(extData.principalPaid.toString(), 18),
                        interestPaid: extInterest,
                        status: extData.status,
                        verifyProof: extData.proof
                    };

                    console.log(`[Bond #${bondId}] Sending update to OracleAdapter...`);
                    const tx = await oracleAdapter.updateAssetStatus(bondId, updateData);
                    const receipt = await tx.wait();
                    console.log(`[Bond #${bondId}] Sync successful! Tx: ${receipt.hash}`);
                } else {
                    console.log(`[Bond #${bondId}] No change. On-chain stay synchronized.`);
                }
            } catch (error) {
                console.error(`[Error] Failed to sync Bond #${bondId}:`, error);
            }
        }
    };

    // Initial run
    await runSync();

    // Loop
    setInterval(runSync, CONFIG.SYNC_INTERVAL_MS);
}

main().catch((error) => {
    console.error("Relayer Critical Error:", error);
});
