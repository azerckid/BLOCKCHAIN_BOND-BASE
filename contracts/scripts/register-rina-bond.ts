import { ethers } from "hardhat";

/**
 * Rina 캐릭터용 Bond 102 등록 (V3 YieldDistributor)
 *
 * - registerBond(102)
 * - setAuditRequirement(102, true)
 *
 * 사용: npx hardhat run scripts/register-rina-bond.ts --network creditcoin-testnet
 * 필요: PRIVATE_KEY (Creditcoin testnet에서 calldata 유지를 위해 Wallet 서명 사용)
 */
const V3_YIELD_DISTRIBUTOR_ADDRESS = "0x0D38d19dA1dC7F018d9B31963860A39329bf6974";
const RINA_BOND_ID = 102;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Account:", deployer.address);
    console.log("YieldDistributor (V3):", V3_YIELD_DISTRIBUTOR_ADDRESS);
    console.log("Rina Bond ID:", RINA_BOND_ID);

    const yieldDistributor = await ethers.getContractAt(
        "YieldDistributor",
        V3_YIELD_DISTRIBUTOR_ADDRESS
    );

    const provider = deployer.provider;
    if (!provider) throw new Error("No provider");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY env required for this network");
    const wallet = new ethers.Wallet(privateKey, provider);

    const sendToYD = async (method: string, args: unknown[]) => {
        const dataHex = yieldDistributor.interface.encodeFunctionData(method, args);
        if (!dataHex || dataHex.length < 10) {
            throw new Error("encodeFunctionData failed: data length " + (dataHex?.length ?? 0));
        }
        const network = await provider.getNetwork();
        const nonce = await provider.getTransactionCount(wallet.address, "pending");
        const feeData = await provider.getFeeData();
        const txRequest = {
            to: V3_YIELD_DISTRIBUTOR_ADDRESS,
            data: dataHex,
            gasLimit: 200_000n,
            chainId: network.chainId,
            nonce,
            type: 2,
            maxFeePerGas: feeData.maxFeePerGas ?? 500_000_001n,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? 500_000_000n,
        };
        const signed = await wallet.signTransaction(txRequest);
        if (!signed) throw new Error("signTransaction returned null");
        const tx = await provider.broadcastTransaction(signed);
        return tx.wait();
    };

    console.log("\n1. YieldDistributor.registerBond(" + RINA_BOND_ID + ")...");
    const bondInfo = await yieldDistributor.bonds(RINA_BOND_ID);
    if (bondInfo.isRegistered) {
        console.log("   Already registered. Skip.");
    } else {
        await sendToYD("registerBond", [RINA_BOND_ID]);
        console.log("   Done.");
    }

    console.log("\n2. YieldDistributor.setAuditRequirement(" + RINA_BOND_ID + ", true)...");
    await sendToYD("setAuditRequirement", [RINA_BOND_ID, true]);
    console.log("   Done.");

    console.log("\n--- Rina Bond " + RINA_BOND_ID + " registration complete ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
