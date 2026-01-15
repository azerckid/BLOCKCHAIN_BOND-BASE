import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting Deployment to Creditcoin Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log(`📡 Deploying contracts with the account: ${deployer.address}`);

    // 1. Deploy MockUSDC
    console.log("\n1️⃣  Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log(`✅ MockUSDC deployed at: ${usdcAddress}`);

    // 2. Deploy BondToken
    console.log("\n2️⃣  Deploying BondToken...");
    const BondToken = await ethers.getContractFactory("BondToken");
    const bondToken = await BondToken.deploy();
    await bondToken.waitForDeployment();
    const bondTokenAddress = await bondToken.getAddress();
    console.log(`✅ BondToken deployed at: ${bondTokenAddress}`);

    // 3. Deploy LiquidityPool
    console.log("\n3️⃣  Deploying LiquidityPool...");
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(usdcAddress, bondTokenAddress);
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    console.log(`✅ LiquidityPool deployed at: ${liquidityPoolAddress}`);

    // 4. Deploy YieldDistributor (Assuming Target Bond ID = 1 for pilot)
    console.log("\n4️⃣  Deploying YieldDistributor...");
    const TARGET_BOND_ID = 1;
    const YieldDistributor = await ethers.getContractFactory("YieldDistributor");
    const yieldDistributor = await YieldDistributor.deploy(usdcAddress, bondTokenAddress, TARGET_BOND_ID);
    await yieldDistributor.waitForDeployment();
    const yieldDistributorAddress = await yieldDistributor.getAddress();
    console.log(`✅ YieldDistributor deployed at: ${yieldDistributorAddress}`);

    // 5. Configuration (Grant Roles)
    console.log("\n5️⃣  Configuring Roles...");

    // Grant MINTER_ROLE to LiquidityPool
    const MINTER_ROLE = await bondToken.MINTER_ROLE();
    const tx1 = await bondToken.grantRole(MINTER_ROLE, liquidityPoolAddress);
    await tx1.wait();
    console.log(`👉 Granted MINTER_ROLE to LiquidityPool (${liquidityPoolAddress})`);

    // Verify
    const hasRole = await bondToken.hasRole(MINTER_ROLE, liquidityPoolAddress);
    console.log(`   Verification: LiquidityPool has MINTER_ROLE? ${hasRole}`);

    console.log("\n🎉 Deployment Complete!");
    console.log("----------------------------------------------------");
    console.log(`MockUSDC:         ${usdcAddress}`);
    console.log(`BondToken:        ${bondTokenAddress}`);
    console.log(`LiquidityPool:    ${liquidityPoolAddress}`);
    console.log(`YieldDistributor: ${yieldDistributorAddress}`);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
