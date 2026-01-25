import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const CHOONSIM_BOND_ID = 101;

    console.log(`Registering Bond ID ${CHOONSIM_BOND_ID} on ${YIELD_DISTRIBUTOR_ADDRESS}...`);

    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);

    // Check if already registered
    const bondInfo = await YieldDistributor.bonds(CHOONSIM_BOND_ID);
    if (bondInfo.isRegistered) {
        console.log("Bond already registered.");
        return;
    }

    const tx = await YieldDistributor.registerBond(CHOONSIM_BOND_ID);
    await tx.wait();

    console.log("✅ Bond registered successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
