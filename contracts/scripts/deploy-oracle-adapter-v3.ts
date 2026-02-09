import { ethers } from "hardhat";

/**
 * Choice B: V3 전용 OracleAdapter 신규 배포 (V3 YieldDistributor + V3 MockUSDC)
 * - OracleAdapter 배포
 * - YieldDistributor.grantRole(DISTRIBUTOR_ROLE, new OracleAdapter) [Creditcoin testnet: Wallet 서명으로 전송]
 * - OracleAdapter.grantRole(ORACLE_ROLE, deployer)
 *
 * 사용: npx hardhat run scripts/deploy-oracle-adapter-v3.ts --network creditcoin-testnet
 * 완료 후 frontend/app/config/contracts.ts, relayer/src/config.ts 의 OracleAdapter 주소를 출력된 주소로 갱신.
 */
const V3_YIELD_DISTRIBUTOR_ADDRESS = "0x0D38d19dA1dC7F018d9B31963860A39329bf6974";
const V3_MOCK_USDC_ADDRESS = "0x03E7d375e76A105784BFF5867f608541e89D311B";

async function main() {
    const [deployer] = await ethers.getSigners();
    const provider = deployer.provider;
    if (!provider) throw new Error("No provider");

    console.log("Deployer:", deployer.address);
    console.log("V3 YieldDistributor:", V3_YIELD_DISTRIBUTOR_ADDRESS);
    console.log("V3 MockUSDC:", V3_MOCK_USDC_ADDRESS);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY env required for YD.grantRole on this network");
    const wallet = new ethers.Wallet(privateKey, provider);

    const yieldDistributor = await ethers.getContractAt(
        "YieldDistributor",
        V3_YIELD_DISTRIBUTOR_ADDRESS
    );

    console.log("\n1. Deploying OracleAdapter (V3 YD + V3 USDC)...");
    const OracleAdapter = await ethers.getContractFactory("OracleAdapter");
    const oracleAdapter = await OracleAdapter.deploy(V3_YIELD_DISTRIBUTOR_ADDRESS, V3_MOCK_USDC_ADDRESS);
    await oracleAdapter.waitForDeployment();
    const newOracleAdapterAddress = await oracleAdapter.getAddress();
    console.log("   OracleAdapter deployed at:", newOracleAdapterAddress);

    const sendToYD = async (method: string, args: unknown[]) => {
        const dataHex = yieldDistributor.interface.encodeFunctionData(method, args);
        if (!dataHex || dataHex.length < 10) throw new Error("encodeFunctionData failed");
        const network = await provider.getNetwork();
        const nonce = await provider.getTransactionCount(wallet.address, "pending");
        const feeData = await provider.getFeeData();
        const signed = await wallet.signTransaction({
            to: V3_YIELD_DISTRIBUTOR_ADDRESS,
            data: dataHex,
            gasLimit: 200_000n,
            chainId: network.chainId,
            nonce,
            type: 2,
            maxFeePerGas: feeData.maxFeePerGas ?? 500_000_001n,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? 500_000_000n,
        });
        if (!signed) throw new Error("signTransaction returned null");
        const tx = await provider.broadcastTransaction(signed);
        return tx.wait();
    };

    console.log("\n2. YieldDistributor.grantRole(DISTRIBUTOR_ROLE, new OracleAdapter)...");
    const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
    await sendToYD("grantRole", [DISTRIBUTOR_ROLE, newOracleAdapterAddress]);
    console.log("   Done.");

    console.log("\n3. OracleAdapter.grantRole(ORACLE_ROLE, deployer)...");
    const ORACLE_ROLE = await oracleAdapter.ORACLE_ROLE();
    const tx2 = await oracleAdapter.grantRole(ORACLE_ROLE, deployer.address);
    await tx2.wait();
    console.log("   Done.");

    console.log("\n--- V3 OracleAdapter setup complete ---");
    console.log("NEW_ORACLE_ADAPTER_ADDRESS=" + newOracleAdapterAddress);
    console.log("Update frontend/app/config/contracts.ts OracleAdapter.address and relayer/src/config.ts ORACLE_ADAPTER_ADDRESS to the above.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
