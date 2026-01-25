import { ethers } from "hardhat";

async function main() {
    const USDC_ADDRESS = "0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364";
    const RELAYER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const AMOUNT = ethers.parseUnits("1000000", 18);

    console.log(`Setting up Relayer USDC balance for ${RELAYER_ADDRESS}...`);

    const USDC = await ethers.getContractAt("MockUSDC", USDC_ADDRESS);

    // Mint USDC to Relayer
    console.log("Minting Mock USDC to Relayer...");
    const mintTx = await USDC.mint(RELAYER_ADDRESS, AMOUNT);
    await mintTx.wait();

    console.log("✅ Relayer minting completed!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
