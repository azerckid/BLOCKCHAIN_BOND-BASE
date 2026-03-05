/**
 * MockUSDC 총 발행량(totalSupply) 및 선택 주소 잔액 조회 (읽기 전용, PRIVATE_KEY 불필요)
 * 사용: npx hardhat run scripts/check-mock-usdc-supply.ts --network creditcoin-testnet
 */
import { ethers } from "hardhat";

const V3_MOCK_USDC = "0x03E7d375e76A105784BFF5867f608541e89D311B";
const ERC20_ABI = [
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
];

async function main() {
    const provider = ethers.provider;
    if (!provider) throw new Error("No provider");

    const usdc = new ethers.Contract(V3_MOCK_USDC, ERC20_ABI, provider);

    const totalSupply = await usdc.totalSupply();
    const totalFormatted = ethers.formatUnits(totalSupply, 18);

    console.log("MockUSDC (V3):", V3_MOCK_USDC);
    console.log("Total supply (raw):", totalSupply.toString());
    console.log("Total supply (formatted):", totalFormatted, "USDC");
    console.log("");

    // Relayer 주소가 env에 있으면 해당 주소 잔액도 출력 (선택)
    const relayerAddress = process.env.RELAYER_PRIVATE_KEY
        ? new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY).address
        : null;
    if (relayerAddress) {
        const relayerBalance = await usdc.balanceOf(relayerAddress);
        console.log("Relayer balance:", ethers.formatUnits(relayerBalance, 18), "USDC");
    }
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
