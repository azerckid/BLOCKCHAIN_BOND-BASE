import { ethers } from "ethers";
import { CONFIG, ABIS } from "../src/config.js";

async function check() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

    const oracleAdapter = new ethers.Contract(CONFIG.ORACLE_ADAPTER_ADDRESS, ABIS.OracleAdapter, wallet) as any;
    const mockUsdc = new ethers.Contract(CONFIG.MOCK_USDC_ADDRESS, ABIS.MockUSDC, wallet) as any;

    console.log(`Checking Relayer: ${wallet.address}`);

    // Check USDC Balance
    try {
        const balance = await (mockUsdc as any).balanceOf(wallet.address);
        console.log(`USDC Balance: ${ethers.formatUnits(balance, 18)} USDC`);
    } catch (e) {
        console.log("Failed to get USDC balance.");
    }

    // Check ORACLE_ROLE
    try {
        const ORACLE_ROLE = await oracleAdapter.ORACLE_ROLE();
        const hasRole = await oracleAdapter.hasRole(ORACLE_ROLE, wallet.address);
        console.log(`ORACLE_ROLE Hash: ${ORACLE_ROLE}`);
        console.log(`Has ORACLE_ROLE: ${hasRole}`);

        const ydAddress = await oracleAdapter.yieldDistributor();
        console.log(`YieldDistributor in OracleAdapter: ${ydAddress}`);

        const yd = new ethers.Contract(ydAddress, ["function bonds(uint256) public view returns (uint256 rewardPerTokenStored, uint256 totalHoldings, bool isRegistered)"], provider) as any;
        const bondInfo = await yd.bonds(1);
        console.log(`Bond #1 Info: Registered=${bondInfo.isRegistered}, Holdings=${bondInfo.totalHoldings.toString()}`);
    } catch (e: any) {
        console.log(`Failed to check roles/config: ${e.message}`);
    }

    // Check if OracleAdapter address is correct by calling getImpactData(1)
    try {
        const impact = await oracleAdapter.getImpactData(1);
        console.log(`Contract call successful. Current Carbon for Bond #1: ${impact.carbonReduced}`);
    } catch (e: any) {
        console.log(`Failed to call getImpactData: ${e.message}`);
    }

    try {
        const perf = await oracleAdapter.getAssetPerformance(1);
        console.log(`Contract call successful. Current Principal for Bond #1: ${perf.principalPaid}`);
    } catch (e: any) {
        console.log(`Failed to call getAssetPerformance: ${e.message}`);
    }
}

check().catch(console.error);
