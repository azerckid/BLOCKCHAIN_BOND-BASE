import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const BOND_ID = 999;

    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);
    const [deployer] = await ethers.getSigners();

    console.log(`Setting audit requirement for Bond ID ${BOND_ID} as ${deployer.address}...`);
    try {
        const tx = await YieldDistributor.setAuditRequirement(BOND_ID, true, { gasLimit: 500000 });
        await tx.wait();
        console.log("✅ setAuditRequirement for 999 successful!");
    } catch (error: any) {
        console.error("❌ setAuditRequirement for 999 FAILED!");
        console.error(error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
