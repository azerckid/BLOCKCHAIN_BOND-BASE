import { ethers } from "hardhat";

async function main() {
    const BOND_TOKEN_ADDRESS = "0xcD8BdED91974cee972fd39f1A9471490E1F1C504";
    const YIELD_DISTRIBUTOR_ADDRESS = "0xcF427f89B38dbfd3fB230B63B17f5C0aa6362700";

    const BondToken = await ethers.getContractAt("BondToken", BOND_TOKEN_ADDRESS);
    const MINTER_ROLE = await BondToken.MINTER_ROLE();

    console.log(`Checking if YieldDistributor (${YIELD_DISTRIBUTOR_ADDRESS}) has MINTER_ROLE on BondToken...`);
    const hasRole = await BondToken.hasRole(MINTER_ROLE, YIELD_DISTRIBUTOR_ADDRESS);

    if (hasRole) {
        console.log("✅ YieldDistributor HAS MINTER_ROLE. Reinvestment will work!");
    } else {
        console.log("❌ YieldDistributor DOES NOT have MINTER_ROLE. Fixing now...");
        const tx = await BondToken.grantRole(MINTER_ROLE, YIELD_DISTRIBUTOR_ADDRESS);
        await tx.wait();
        console.log("✅ FIXED: MINTER_ROLE granted to YieldDistributor.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
