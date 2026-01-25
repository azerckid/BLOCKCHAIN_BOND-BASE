import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const CHOONSIM_BOND_ID = 101;

    console.log(`Setting audit requirement for Bond ID ${CHOONSIM_BOND_ID} on ${YIELD_DISTRIBUTOR_ADDRESS}...`);

    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);

    // Explicitly set gas limit to avoid estimateGas failures
    const tx = await YieldDistributor.setAuditRequirement(CHOONSIM_BOND_ID, true, { gasLimit: 500000 });
    await tx.wait();

    console.log(`✅ Audit requirement enabled for Bond ${CHOONSIM_BOND_ID}.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
