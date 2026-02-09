import { ethers } from "hardhat";

/**
 * V3 배포 후 1회 실행: OracleAdapter 연동 + Choonsim Bond 101 등록
 *
 * 1. 기존 OracleAdapter가 신규 YieldDistributor를 참조하도록 setYieldDistributor 호출
 * 2. 신규 YieldDistributor에서 OracleAdapter에 DISTRIBUTOR_ROLE 부여
 * 3. Bond ID 101 (Choonsim) 등록 및 setAuditRequirement(101, true)
 *
 * 사용: npx hardhat run scripts/setup-v3-post-deploy.ts --network creditcoin-testnet
 *
 * 주소는 redeploy_v3.ts 실행 결과로 갱신된 값을 사용한다.
 */
const V3_YIELD_DISTRIBUTOR_ADDRESS = "0x0D38d19dA1dC7F018d9B31963860A39329bf6974";
const EXISTING_ORACLE_ADAPTER_ADDRESS = "0xE666695145795D8D83C3b373eDd579bDD59994A6";
const CHOONSIM_BOND_ID = 101;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Setup account:", deployer.address);
    console.log("V3 YieldDistributor:", V3_YIELD_DISTRIBUTOR_ADDRESS);
    console.log("OracleAdapter (existing):", EXISTING_ORACLE_ADAPTER_ADDRESS);

    const yieldDistributor = await ethers.getContractAt(
        "YieldDistributor",
        V3_YIELD_DISTRIBUTOR_ADDRESS
    );
    const oracleAdapter = await ethers.getContractAt(
        "OracleAdapter",
        EXISTING_ORACLE_ADAPTER_ADDRESS
    );

    // --- 1. OracleAdapter -> 신규 YieldDistributor 연결 ---
    console.log("\n1. OracleAdapter.setYieldDistributor(V3 YieldDistributor)...");
    const currentYD = await oracleAdapter.yieldDistributor();
    if (currentYD.toLowerCase() === V3_YIELD_DISTRIBUTOR_ADDRESS.toLowerCase()) {
        console.log("   Already set. Skip.");
    } else {
        const tx1 = await oracleAdapter.setYieldDistributor(V3_YIELD_DISTRIBUTOR_ADDRESS);
        await tx1.wait();
        console.log("   Done.");
    }

    // Creditcoin testnet: sendTransaction이 data를 누락시키므로, ethers.Wallet으로 서명 후 eth_sendRawTransaction 전송 (HardhatEthersSigner는 signTransaction 미구현)
    const provider = deployer.provider;
    if (!provider) throw new Error("No provider");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY env required for YieldDistributor txs on this network");
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

    // --- 2. YieldDistributor: OracleAdapter에 DISTRIBUTOR_ROLE 부여 ---
    console.log("\n2. YieldDistributor.grantRole(DISTRIBUTOR_ROLE, OracleAdapter)...");
    const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
    const hasRole = await yieldDistributor.hasRole(DISTRIBUTOR_ROLE, EXISTING_ORACLE_ADAPTER_ADDRESS);
    if (hasRole) {
        console.log("   Already granted. Skip.");
    } else {
        await sendToYD("grantRole", [DISTRIBUTOR_ROLE, EXISTING_ORACLE_ADAPTER_ADDRESS]);
        console.log("   Done.");
    }

    // --- 3. Bond ID 101 (Choonsim) 등록 ---
    console.log("\n3. YieldDistributor.registerBond(" + CHOONSIM_BOND_ID + ")...");
    const bondInfo = await yieldDistributor.bonds(CHOONSIM_BOND_ID);
    if (bondInfo.isRegistered) {
        console.log("   Already registered. Skip.");
    } else {
        await sendToYD("registerBond", [CHOONSIM_BOND_ID]);
        console.log("   Done.");
    }

    // --- 4. Bond 101 감사 요건 설정 ---
    console.log("\n4. YieldDistributor.setAuditRequirement(" + CHOONSIM_BOND_ID + ", true)...");
    await sendToYD("setAuditRequirement", [CHOONSIM_BOND_ID, true]);
    console.log("   Done.");

    console.log("\n--- Setup complete ---");
    console.log("- OracleAdapter -> V3 YieldDistributor linked");
    console.log("- DISTRIBUTOR_ROLE granted to OracleAdapter on V3 YieldDistributor");
    console.log("- Bond " + CHOONSIM_BOND_ID + " registered and requiresAudit = true");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
