import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const BOND_ID = 101;

    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);

    const value = await YieldDistributor.requiresAudit(BOND_ID);
    console.log(`Current requiresAudit[${BOND_ID}]: ${value}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
