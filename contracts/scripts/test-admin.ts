import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);
    const [deployer] = await ethers.getSigners();

    console.log(`Attempting to register bond 999 as ${deployer.address}...`);
    try {
        const tx = await YieldDistributor.registerBond(999, { gasLimit: 500000 });
        await tx.wait();
        console.log("✅ registerBond successful!");
    } catch (error: any) {
        console.error("❌ registerBond FAILED!");
        console.error(error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
