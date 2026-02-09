import { ethers } from "hardhat";
async function main() {
    const [d] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(d.address);
    console.log(`Address: ${d.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} CTC`);
}
main().catch(console.error);
