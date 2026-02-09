import { ethers } from "hardhat";

/**
 * Phase 3 redeploy: Pausable + SafeERC20 + bond registration check.
 * Same as redeploy_v2 plus LiquidityPool.setYieldDistributor for bond validation.
 */
async function main() {
    console.log("Starting Integrated V3 Deployment (Phase 3: Pausable, SafeERC20, bond check)...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    console.log("\n1. Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("MockUSDC deployed at:", usdcAddress);

    console.log("\n2. Deploying BondToken...");
    const BondToken = await ethers.getContractFactory("BondToken");
    const bondToken = await BondToken.deploy();
    await bondToken.waitForDeployment();
    const bondTokenAddress = await bondToken.getAddress();
    console.log("BondToken deployed at:", bondTokenAddress);

    console.log("\n3. Deploying YieldDistributor (v3)...");
    const YieldDistributor = await ethers.getContractFactory("YieldDistributor");
    const yieldDistributor = await YieldDistributor.deploy(usdcAddress);
    await yieldDistributor.waitForDeployment();
    const yieldDistributorAddress = await yieldDistributor.getAddress();
    console.log("YieldDistributor deployed at:", yieldDistributorAddress);

    console.log("\n4. Deploying LiquidityPool (v3)...");
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(usdcAddress, bondTokenAddress);
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    console.log("LiquidityPool deployed at:", liquidityPoolAddress);

    console.log("\n5. Initializing System Integration...");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const hasAdmin = await yieldDistributor.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log("Deployer has DEFAULT_ADMIN_ROLE on YieldDistributor:", hasAdmin);
    if (!hasAdmin) throw new Error("Deployer missing DEFAULT_ADMIN_ROLE on YieldDistributor");

    console.log("Linking: BondToken.setYieldDistributor(", yieldDistributorAddress, ")...");
    await (await bondToken.setYieldDistributor(yieldDistributorAddress)).wait();
    console.log("Linking: YieldDistributor.setBondToken(", bondTokenAddress, ")...");
    const populated = await yieldDistributor.setBondToken.populateTransaction(bondTokenAddress);
    const dataToSend = populated.data ?? yieldDistributor.interface.encodeFunctionData("setBondToken", [bondTokenAddress]);
    if (!dataToSend || dataToSend.length < 10) {
        throw new Error("setBondToken calldata missing (length " + (dataToSend?.length ?? 0) + "). Check YieldDistributor ABI.");
    }
    console.log("Calldata length:", dataToSend.length);

    const callResult = await deployer.provider!.call({
        to: yieldDistributorAddress,
        from: deployer.address,
        data: dataToSend,
    }).then(() => "ok" as const).catch((e: unknown) => e as { data?: string; error?: { data?: string }; reason?: string });
    if (callResult !== "ok") {
        const revertData = callResult?.data ?? (callResult?.error as { data?: string })?.data;
        if (revertData && typeof revertData === "string" && revertData.length > 2) {
            try {
                const decoded = yieldDistributor.interface.parseError(revertData as `0x${string}`);
                console.error("eth_call revert:", decoded?.name ?? "unknown", decoded?.args?.length ? decoded.args : "");
            } catch (_) {
                console.error("eth_call revert (raw):", revertData.slice(0, 138));
            }
        } else {
            console.error("eth_call failed:", callResult?.reason ?? "no data");
        }
    }

    try {
        const tx = await deployer.sendTransaction({
            to: yieldDistributorAddress,
            data: dataToSend,
        });
        await tx.wait();
    } catch (err: unknown) {
        const e = err as { receipt?: { hash?: string } };
        if (e?.receipt?.hash && deployer.provider) {
            const onChainTx = await deployer.provider.getTransaction(e.receipt.hash);
            console.error("On-chain tx data length:", onChainTx?.data?.length ?? 0, "(if 0, RPC/signer dropped calldata)");
        }
        throw err;
    }

    const readBack = await yieldDistributor.bondToken();
    if (readBack === ethers.ZeroAddress) {
        throw new Error("YieldDistributor.bondToken() is zero after setBondToken - check chain ABI/calldata.");
    }
    console.log("YieldDistributor.bondToken set to:", readBack);

    console.log("Registering Bond ID 1 in YieldDistributor...");
    await (await yieldDistributor.registerBond(1)).wait();

    console.log("Granting Roles...");
    const MINTER_ROLE = await bondToken.MINTER_ROLE();
    await (await bondToken.grantRole(MINTER_ROLE, liquidityPoolAddress)).wait();
    await (await bondToken.grantRole(MINTER_ROLE, yieldDistributorAddress)).wait();
    console.log("Granted MINTER_ROLE to LiquidityPool and YieldDistributor");

    console.log("Setting LiquidityPool in YieldDistributor...");
    await (await yieldDistributor.setLiquidityPool(liquidityPoolAddress)).wait();

    console.log("Setting YieldDistributor in LiquidityPool (bond registration check)...");
    await (await liquidityPool.setYieldDistributor(yieldDistributorAddress)).wait();

    console.log("\nV3 Integrated Deployment Complete.");
    console.log("----------------------------------------------------");
    console.log("MockUSDC:         ", usdcAddress);
    console.log("BondToken:        ", bondTokenAddress);
    console.log("LiquidityPool:    ", liquidityPoolAddress);
    console.log("YieldDistributor: ", yieldDistributorAddress);
    console.log("----------------------------------------------------");
    console.log("Next: Update frontend/app/config/contracts.ts, relayer/src/config.ts, CLAUDE.md, docs/03_Specs/01_INFRASTRUCTURE.md with the above addresses.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
