import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);
    const [deployer] = await ethers.getSigners();

    console.log(`Checking roles for address: ${deployer.address}`);
    const hasAdmin = await YieldDistributor.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log(`Has DEFAULT_ADMIN_ROLE: ${hasAdmin}`);

    // Check if bond is registered
    const bondInfo = await YieldDistributor.bonds(101);
    console.log(`Bond 101 Registered: ${bondInfo.isRegistered}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
