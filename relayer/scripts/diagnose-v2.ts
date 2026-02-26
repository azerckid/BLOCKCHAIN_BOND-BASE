import { ethers } from "ethers";
import { CONFIG, ABIS } from "../src/config.js";

async function diagnose() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

    const ADAPTER_ABI = [
        ...ABIS.OracleAdapter,
        "function yieldDistributor() view returns (address)",
        "function usdcToken() view returns (address)"
    ];

    const oracleAdapter = new ethers.Contract(CONFIG.ORACLE_ADAPTER_ADDRESS, ADAPTER_ABI, wallet);

    console.log("--- Comprehensive Diagnostics ---");
    console.log(`Relayer Address: ${wallet.address}`);
    console.log(`Relayer USDC Balance: ${ethers.formatUnits(await new ethers.Contract(CONFIG.MOCK_USDC_ADDRESS, ABIS.MockUSDC, provider).balanceOf(wallet.address), 18)}`);

    try {
        const adapterUsdc = await oracleAdapter.usdcToken();
        const ydAddress = await oracleAdapter.yieldDistributor();

        console.log(`OracleAdapter CONFIG USDC: ${CONFIG.MOCK_USDC_ADDRESS}`);
        console.log(`OracleAdapter Contract USDC: ${adapterUsdc}`);
        console.log(`YieldDistributor Address: ${ydAddress}`);

        const ydAbi = [
            "function usdcToken() view returns (address)",
            "function DISTRIBUTOR_ROLE() view returns (bytes32)",
            "function hasRole(bytes32 role, address account) view returns (bool)",
            "function bonds(uint256) view returns (uint256 rewardPerTokenStored, uint256 totalHoldings, bool isRegistered)"
        ];
        const yieldDistributor = new ethers.Contract(ydAddress, ydAbi, wallet);

        const ydUsdc = await yieldDistributor.usdcToken();
        console.log(`YieldDistributor USDC: ${ydUsdc}`);

        const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
        const adapterHasRole = await yieldDistributor.hasRole(DISTRIBUTOR_ROLE, CONFIG.ORACLE_ADAPTER_ADDRESS);
        console.log(`OracleAdapter has DISTRIBUTOR_ROLE: ${adapterHasRole}`);

        const allowance = await new ethers.Contract(CONFIG.MOCK_USDC_ADDRESS, ABIS.MockUSDC, provider).allowance(wallet.address, CONFIG.ORACLE_ADAPTER_ADDRESS);
        console.log(`Relayer Allowance to OracleAdapter: ${ethers.formatUnits(allowance, 18)}`);

        for (const bondId of [1, 2]) {
            const bondInfo = await yieldDistributor.bonds(bondId);
            console.log(`Bond #${bondId}: Registered=${bondInfo.isRegistered}, totalHoldings=${ethers.formatUnits(bondInfo.totalHoldings, 18)}`);

            const onChainPerf = await oracleAdapter.getAssetPerformance(bondId);
            console.log(`Bond #${bondId} On-chain Interest: ${ethers.formatUnits(onChainPerf.interestPaid, 18)}`);
        }

    } catch (e: any) {
        console.error("Diagnosis failed:", e.message);
    }
}

diagnose();
