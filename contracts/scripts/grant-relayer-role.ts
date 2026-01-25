import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR_ADDRESS = "0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308";
    const RELAYER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));

    console.log(`Granting DISTRIBUTOR_ROLE to ${RELAYER_ADDRESS} on ${YIELD_DISTRIBUTOR_ADDRESS}...`);

    const YieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR_ADDRESS);

    const tx = await YieldDistributor.grantRole(DISTRIBUTOR_ROLE, RELAYER_ADDRESS);
    await tx.wait();

    console.log("✅ Role granted successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
