import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const CHOONSIM_BOND_ID = 101;

    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);
    const [deployer] = await ethers.getSigners();

    console.log(`Simulating setAuditRequirement for Bond ID ${CHOONSIM_BOND_ID}...`);

    try {
        await YieldDistributor.setAuditRequirement.staticCall(CHOONSIM_BOND_ID, true);
        console.log("✅ Simulation successful! No revert.");
    } catch (error: any) {
        console.error("❌ Simulation REVERTED!");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
