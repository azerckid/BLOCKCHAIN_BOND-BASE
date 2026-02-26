import { ethers } from "ethers";
import { CONFIG, ABIS } from "../src/config.js";

async function checkAdmin() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

    const ADAPTER_ABI = [
        ...ABIS.OracleAdapter,
        "function yieldDistributor() view returns (address)"
    ];

    const oracleAdapter = new ethers.Contract(CONFIG.ORACLE_ADAPTER_ADDRESS, ADAPTER_ABI, wallet);

    try {
        const ydAddress = await oracleAdapter.yieldDistributor();
        const ydAbi = [
            "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
            "function hasRole(bytes32 role, address account) view returns (bool)",
            "function registerBond(uint256 bondId) external"
        ];
        const yieldDistributor = new ethers.Contract(ydAddress, ydAbi, wallet);

        const ADMIN_ROLE = await yieldDistributor.DEFAULT_ADMIN_ROLE();
        const isAdmin = await yieldDistributor.hasRole(ADMIN_ROLE, wallet.address);
        console.log(`Relayer is Admin of YieldDistributor: ${isAdmin}`);

        if (isAdmin) {
            console.log("Relayer is admin. Proceeding to register Bond #2...");
            const tx = await yieldDistributor.registerBond(2);
            await tx.wait();
            console.log("Bond #2 registered successfully!");
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

checkAdmin();
