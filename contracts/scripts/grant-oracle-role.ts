import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR = "0xcF427f89B38dbfd3fB230B63B17f5C0aa6362700";
    const RELAYER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    const yieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR);
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

    console.log(`Granting ORACLE_ROLE to ${RELAYER}...`);
    const tx = await yieldDistributor.grantRole(ORACLE_ROLE, RELAYER);
    await tx.wait();
    console.log("✅ ORACLE_ROLE granted successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
