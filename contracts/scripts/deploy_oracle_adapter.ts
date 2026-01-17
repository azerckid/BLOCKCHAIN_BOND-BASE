import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying OracleAdapter to Creditcoin Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log(`📡 Using account: ${deployer.address}`);

    // Addresses from frontend/app/config/contracts.ts
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const MOCK_USDC_ADDRESS = "0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364";

    // 1. Deploy OracleAdapter
    console.log("\n1️⃣  Deploying OracleAdapter...");
    const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
    const oracleAdapter = await OracleAdapter.deploy(YIELD_DISTRIBUTOR_ADDRESS, MOCK_USDC_ADDRESS);
    await oracleAdapter.waitForDeployment();
    const oracleAdapterAddress = await oracleAdapter.getAddress();
    console.log(`✅ OracleAdapter deployed at: ${oracleAdapterAddress}`);

    // 2. Grant DISTRIBUTOR_ROLE to OracleAdapter in YieldDistributor
    console.log("\n2️⃣  Granting DISTRIBUTOR_ROLE to OracleAdapter in YieldDistributor...");
    const YieldDistributor = await ethers.getContractFactory("YieldDistributor");
    const yieldDistributor = YieldDistributor.attach(YIELD_DISTRIBUTOR_ADDRESS);

    // @ts-ignore
    const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
    // @ts-ignore
    const tx = await yieldDistributor.grantRole(DISTRIBUTOR_ROLE, oracleAdapterAddress);
    await tx.wait();
    console.log(`✅ Granted DISTRIBUTOR_ROLE to ${oracleAdapterAddress}`);

    // 3. Grant ORACLE_ROLE to deployer for testing
    console.log("\n3️⃣  Granting ORACLE_ROLE to deployer...");
    const ORACLE_ROLE = await oracleAdapter.ORACLE_ROLE();
    const tx2 = await oracleAdapter.grantRole(ORACLE_ROLE, deployer.address);
    await tx2.wait();
    console.log(`✅ Granted ORACLE_ROLE to ${deployer.address}`);

    console.log("\n🎉 Setup Complete!");
    console.log("----------------------------------------------------");
    console.log(`OracleAdapter: ${oracleAdapterAddress}`);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
