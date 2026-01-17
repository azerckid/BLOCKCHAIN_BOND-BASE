import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying MockOracle to Creditcoin Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log(`📡 Using account: ${deployer.address}`);

    // Addresses from frontend/app/config/contracts.ts
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const MOCK_USDC_ADDRESS = "0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364";

    // 1. Deploy MockOracle
    console.log("\n1️⃣  Deploying MockOracle...");
    const MockOracle = await ethers.getContractFactory("MockOracle");
    const mockOracle = await MockOracle.deploy(YIELD_DISTRIBUTOR_ADDRESS, MOCK_USDC_ADDRESS);
    await mockOracle.waitForDeployment();
    const mockOracleAddress = await mockOracle.getAddress();
    console.log(`✅ MockOracle deployed at: ${mockOracleAddress}`);

    // 2. Grant DISTRIBUTOR_ROLE to MockOracle in YieldDistributor
    console.log("\n2️⃣  Granting DISTRIBUTOR_ROLE to MockOracle in YieldDistributor...");
    const YieldDistributor = await ethers.getContractFactory("YieldDistributor");
    const yieldDistributor = YieldDistributor.attach(YIELD_DISTRIBUTOR_ADDRESS);

    // @ts-ignore
    const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
    // @ts-ignore
    const tx = await yieldDistributor.grantRole(DISTRIBUTOR_ROLE, mockOracleAddress);
    await tx.wait();
    console.log(`✅ Granted DISTRIBUTOR_ROLE to ${mockOracleAddress}`);

    console.log("\n🎉 Setup Complete!");
    console.log("----------------------------------------------------");
    console.log(`MockOracle: ${mockOracleAddress}`);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
