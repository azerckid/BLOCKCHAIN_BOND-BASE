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

    try {
        const ydAddress = await oracleAdapter.yieldDistributor();
        const ydAbi = [
            "function bondToken() view returns (address)",
            "function usdcToken() view returns (address)",
            "function DISTRIBUTOR_ROLE() view returns (bytes32)",
            "function hasRole(bytes32 role, address account) view returns (bool)",
            "function bonds(uint256) view returns (uint256 rewardPerTokenStored, uint256 totalHoldings, bool isRegistered)"
        ];
        const yieldDistributor = new ethers.Contract(ydAddress, ydAbi, wallet);

        const btAddress = await yieldDistributor.bondToken();
        console.log(`BondToken Address in YieldDistributor: ${btAddress}`);

        const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
        const adapterHasRole = await yieldDistributor.hasRole(DISTRIBUTOR_ROLE, CONFIG.ORACLE_ADAPTER_ADDRESS);
        console.log(`OracleAdapter has DISTRIBUTOR_ROLE: ${adapterHasRole}`);

    } catch (e: any) {
        console.error("Diagnosis failed:", e.message);
    }
}

diagnose();
