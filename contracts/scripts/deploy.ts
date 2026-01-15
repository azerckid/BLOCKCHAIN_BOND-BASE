import { ethers } from "hardhat";

async function main() {
    console.log("Deploying BondToken...");

    const BondToken = await ethers.getContractFactory("BondToken");
    const bondToken = await BondToken.deploy();

    await bondToken.waitForDeployment();

    const address = await bondToken.getAddress();
    console.log(`BondToken deployed to: ${address}`);

    // Example: Setting a base URI
    const baseURI = "https://api.buildctc.com/metadata/";
    await bondToken.setURI(baseURI);
    console.log(`Base URI set to: ${baseURI}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
