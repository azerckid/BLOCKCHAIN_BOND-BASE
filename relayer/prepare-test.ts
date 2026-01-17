import { ethers } from "ethers";
import { CONFIG, ABIS } from "./src/config.js";

async function prepare() {
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);

    const mockUsdc = new ethers.Contract(CONFIG.MOCK_USDC_ADDRESS, ABIS.MockUSDC, wallet) as any;

    // LiquidityPool ABI
    const lpAbi = [
        "function purchaseBond(uint256 bondId, uint256 amount) external",
        "function usdcToken() external view returns (address)"
    ];
    // Address from frontend/app/config/contracts.ts
    const LP_ADDRESS = "0x290adf245E805D24DF630A01843b3C3Fb20bd082";
    const lp = new ethers.Contract(LP_ADDRESS, lpAbi, wallet) as any;

    console.log(`Preparing Test Account: ${wallet.address}`);

    const bondId = 1;
    const amount = ethers.parseUnits("1000", 18);

    try {
        console.log("1. Approving USDC for LiquidityPool...");
        const tx1 = await mockUsdc.approve(LP_ADDRESS, amount);
        await tx1.wait();
        console.log("Approval successful.");

        console.log(`2. Purchasing Bond #${bondId} (${ethers.formatUnits(amount, 18)} USDC)...`);
        const tx2 = await lp.purchaseBond(bondId, amount);
        await tx2.wait();
        console.log("Bond purchase successful!");

    } catch (error: any) {
        console.error("Preparation failed:", error.message);
    }
}

prepare();
