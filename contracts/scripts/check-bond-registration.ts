import { ethers } from "hardhat";

/**
 * YieldDistributor V3에서 bond 101, 102 등록 여부 조회 (읽기 전용, PRIVATE_KEY 불필요)
 *
 * 사용: npx hardhat run scripts/check-bond-registration.ts --network creditcoin-testnet
 */
const V3_YIELD_DISTRIBUTOR_ADDRESS = "0x0D38d19dA1dC7F018d9B31963860A39329bf6974";

const YD_ABI = [
    "function bonds(uint256) view returns (uint256 rewardPerTokenStored, uint256 totalHoldings, bool isRegistered)",
];

async function main() {
    const provider = ethers.provider;
    if (!provider) throw new Error("No provider");

    const yd = new ethers.Contract(V3_YIELD_DISTRIBUTOR_ADDRESS, YD_ABI, provider);

    console.log("YieldDistributor (V3):", V3_YIELD_DISTRIBUTOR_ADDRESS);
    console.log("");

    for (const [label, id] of [
        ["Choonsim (101)", 101],
        ["Rina (102)", 102],
    ] as const) {
        const info = await yd.bonds(id);
        const isRegistered = info.isRegistered;
        console.log(`Bond ${id} (${label}): isRegistered = ${isRegistered}, totalHoldings = ${info.totalHoldings.toString()}`);
    }

    const rinaInfo = await yd.bonds(102);
    console.log("");
    if (rinaInfo.isRegistered) {
        console.log("Result: Bond 102 (Rina) is already registered on-chain. No need to run register-rina-bond.ts.");
    } else {
        console.log("Result: Bond 102 (Rina) is NOT registered. Run: npx hardhat run scripts/register-rina-bond.ts --network creditcoin-testnet");
    }
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
