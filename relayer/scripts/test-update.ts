import { ethers } from "ethers";
import { CONFIG, ABIS } from "../src/config.js";

async function TestUpdate() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

    const oracleAdapter = new ethers.Contract(CONFIG.ORACLE_ADAPTER_ADDRESS, ABIS.OracleAdapter, wallet) as any;

    console.log(`Relayer: ${wallet.address}`);

    const bondId = 1;
    const onChain = await oracleAdapter.getAssetPerformance(bondId);
    console.log(`On-chain Interest for Bond #${bondId}: ${onChain.interestPaid.toString()}`);

    const perfData = {
        timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago to be safe
        principalPaid: ethers.parseUnits("50000", 18),
        interestPaid: 0,
        status: 0,
        verifyProof: "ipfs://QmMockData1"
    };

    const impactData = {
        carbonReduced: 1200,
        jobsCreated: 15,
        smeSupported: 8,
        reportUrl: "https://rwa-report.com/bond-1"
    };

    try {
        console.log("Simulating updateAssetStatus...");
        // Use estimateGas to see if it would fail
        const gasLimit = await oracleAdapter.updateAssetStatus.estimateGas(bondId, perfData, impactData);
        console.log(`Gas Estimation Successful: ${gasLimit.toString()}`);

        console.log("Sending actual transaction...");
        const tx = await oracleAdapter.updateAssetStatus(bondId, perfData, impactData);
        const receipt = await tx.wait();
        console.log(`Transaction Successful! Hash: ${receipt.hash}`);

    } catch (error: any) {
        console.log("--- Error Details ---");
        if (error.data) {
            console.log("Error Data:", error.data);
            try {
                // Try to decode error data if possible
                const decoded = oracleAdapter.interface.parseError(error.data);
                console.log("Decoded Error:", decoded);
            } catch (e) {
                console.log("Could not decode error data with OracleAdapter ABI.");
            }
        }
        console.error(error.message);
    }
}

TestUpdate();
