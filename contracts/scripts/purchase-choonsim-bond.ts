import { ethers } from "hardhat";

async function main() {
    const LIQUIDITY_POOL_ADDRESS = "0x290adf245E805D24DF630A01843b3C3Fb20bd082";
    const USDC_ADDRESS = "0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364";
    const CHOONSIM_BOND_ID = 101;
    const PURCHASE_AMOUNT = ethers.parseUnits("1000", 18); // 1,000 USDC

    const [deployer] = await ethers.getSigners();
    console.log(`Purchasing Bond ID ${CHOONSIM_BOND_ID} for ${deployer.address}...`);

    const USDC = await ethers.getContractAt("MockUSDC", USDC_ADDRESS);
    const LiquidityPool = await ethers.getContractAt("LiquidityPool", LIQUIDITY_POOL_ADDRESS);

    // 1. Mint USDC if needed (assuming MockUSDC has mint)
    console.log("Minting Mock USDC...");
    const mintTx = await USDC.mint(deployer.address, PURCHASE_AMOUNT);
    await mintTx.wait();

    // 2. Approve LiquidityPool
    console.log("Approving LiquidityPool...");
    const approveTx = await USDC.approve(LIQUIDITY_POOL_ADDRESS, PURCHASE_AMOUNT);
    await approveTx.wait();

    // 3. Purchase Bond
    console.log("Executing purchaseBond...");
    const purchaseTx = await LiquidityPool.purchaseBond(CHOONSIM_BOND_ID, PURCHASE_AMOUNT);
    await purchaseTx.wait();

    console.log("✅ Bond purchased successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
