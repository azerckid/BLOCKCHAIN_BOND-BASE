import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR = "0xcF427f89B38dbfd3fB230B63B17f5C0aa6362700";
    const TEST_USER = "0xf42138298fa1Fc8514BC17D59eBB451AceF3cDBa";
    const BOND_ID = 101;

    const yieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR);

    console.log(`Checking earned yield for ${TEST_USER} on Bond ${BOND_ID}...`);
    const earned = await yieldDistributor.earned(TEST_USER, BOND_ID);
    console.log(`💰 Earned Yield: ${ethers.formatUnits(earned, 18)} USDC`);

    const rewardPerToken = await yieldDistributor.rewardPerToken(BOND_ID);
    console.log(`📊 Reward Per Token: ${rewardPerToken.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
