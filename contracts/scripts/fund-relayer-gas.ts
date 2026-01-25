import { ethers } from "hardhat";

async function main() {
    const RELAYER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const FUND_AMOUNT = ethers.parseEther("1.0"); // 1.0 CTC should be plenty for testnet gas

    const [deployer] = await ethers.getSigners();
    console.log(`Funding Relayer ${RELAYER_ADDRESS} with ${ethers.formatEther(FUND_AMOUNT)} CTC from ${deployer.address}...`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Admin Balance: ${ethers.formatEther(balance)} CTC`);

    if (balance < FUND_AMOUNT) {
        throw new Error("Insufficient CTC balance in Admin account to fund Relayer.");
    }

    const tx = await deployer.sendTransaction({
        to: RELAYER_ADDRESS,
        value: FUND_AMOUNT,
    });

    await tx.wait();

    console.log("✅ Relayer funded with CTC successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
