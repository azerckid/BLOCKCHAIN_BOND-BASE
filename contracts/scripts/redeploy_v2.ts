import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting Integrated V2 Deployment to Creditcoin Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log(`📡 Deploying contracts with the account: ${deployer.address}`);

    // 1. Deploy MockUSDC (If needed, otherwise use existing. For redeploy v2, we'll deploy fresh to ensure a clean slate)
    console.log("\n1️⃣  Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log(`✅ MockUSDC deployed at: ${usdcAddress}`);

    // 2. Deploy BondToken (v2)
    console.log("\n2️⃣  Deploying BondToken (v2)...");
    const BondToken = await ethers.getContractFactory("BondToken");
    const bondToken = await BondToken.deploy();
    await bondToken.waitForDeployment();
    const bondTokenAddress = await bondToken.getAddress();
    console.log(`✅ BondToken (v2) deployed at: ${bondTokenAddress}`);

    // 3. Deploy YieldDistributor (v2)
    console.log("\n3️⃣  Deploying YieldDistributor (v2)...");
    const YieldDistributor = await ethers.getContractFactory("YieldDistributor");
    const yieldDistributor = await YieldDistributor.deploy(usdcAddress);
    await yieldDistributor.waitForDeployment();
    const yieldDistributorAddress = await yieldDistributor.getAddress();
    console.log(`✅ YieldDistributor (v2) deployed at: ${yieldDistributorAddress}`);

    // 4. Deploy LiquidityPool
    console.log("\n4️⃣  Deploying LiquidityPool...");
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(usdcAddress, bondTokenAddress);
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    console.log(`✅ LiquidityPool deployed at: ${liquidityPoolAddress}`);

    // 5. Configuration & Integration (CRITICAL)
    console.log("\n5️⃣  Initializing System Integration...");

    // a. Link BondToken <-> YieldDistributor
    console.log("👉 Linking BondToken and YieldDistributor...");
    await (await bondToken.setYieldDistributor(yieldDistributorAddress)).wait();
    await (await yieldDistributor.setBondToken(bondTokenAddress)).wait();

    // b. Register Initial Bond ID (1)
    console.log("👉 Registering Bond ID 1 in YieldDistributor...");
    await (await yieldDistributor.registerBond(1)).wait();

    // c. Grant Roles
    console.log("👉 Granting Roles...");
    const MINTER_ROLE = await bondToken.MINTER_ROLE();
    await (await bondToken.grantRole(MINTER_ROLE, liquidityPoolAddress)).wait();
    console.log(`✅ Granted MINTER_ROLE to LiquidityPool (${liquidityPoolAddress})`);

    // Grant MINTER_ROLE to YieldDistributor (Required for Reinvest function)
    await (await bondToken.grantRole(MINTER_ROLE, yieldDistributorAddress)).wait();
    console.log(`✅ Granted MINTER_ROLE to YieldDistributor (${yieldDistributorAddress})`);

    // d. Set LiquidityPool in YieldDistributor
    console.log("👉 Setting LiquidityPool in YieldDistributor...");
    await (await yieldDistributor.setLiquidityPool(liquidityPoolAddress)).wait();

    console.log("\n🎉 V2 Integrated Deployment Complete!");
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
