import { ethers } from "hardhat";

async function main() {
    const YIELD_DISTRIBUTOR = "0xcF427f89B38dbfd3fB230B63B17f5C0aa6362700";
    const LIQUIDITY_POOL = "0xdd797Bd099569b982A505cAC3064f1FF3c0A4ea9";
    const MOCK_USDC = "0xf11806bF4c798841b917217338F5b7907dB8938f";
    const RELAYER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const CHOONSIM_BOND_ID = 101;

    const [admin] = await ethers.getSigners();
    console.log(`🚀 Starting Full Choonsim Setup on New Environment...`);

    const yieldDistributor = await ethers.getContractAt("YieldDistributor", YIELD_DISTRIBUTOR);
    const usdc = await ethers.getContractAt("MockUSDC", MOCK_USDC);
    const liquidityPool = await ethers.getContractAt("LiquidityPool", LIQUIDITY_POOL);

    // 1. Register Bond 101
    console.log("1️⃣  Registering Bond 101...");
    await (await yieldDistributor.registerBond(CHOONSIM_BOND_ID)).wait();

    // 2. Enable Audit for Bond 101
    console.log("2️⃣  Enabling Audit for Bond 101...");
    await (await yieldDistributor.setAuditRequirement(CHOONSIM_BOND_ID, true)).wait();

    // 3. Grant Roles to Relayer
    console.log("3️⃣  Granting DISTRIBUTOR_ROLE & ORACLE_ROLE to Relayer...");
    const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

    await (await yieldDistributor.grantRole(DISTRIBUTOR_ROLE, RELAYER)).wait();
    await (await yieldDistributor.grantRole(ORACLE_ROLE, RELAYER)).wait();
    console.log("✅ Roles granted.");

    // 4. Setup Relayer USDC (Mint)
    console.log("4️⃣  Setup Relayer USDC (Minting 1M USDC)...");
    await (await usdc.mint(RELAYER, ethers.parseUnits("1000000", 18))).wait();

    // 5. Fund Relayer CTC (Gas)
    console.log("5️⃣  Funding Relayer Gas...");
    await (await admin.sendTransaction({ to: RELAYER, value: ethers.parseEther("1.0") })).wait();

    // 6. Create Initial Holders (Purchase Bond)
    console.log("6️⃣  Creating Initial Holders (Purchase 1000 Bonds)...");
    const purchaseAmount = ethers.parseUnits("1000", 18);
    await (await usdc.mint(admin.address, purchaseAmount)).wait();
    await (await usdc.approve(LIQUIDITY_POOL, purchaseAmount)).wait();
    await (await liquidityPool.purchaseBond(CHOONSIM_BOND_ID, purchaseAmount)).wait();

    console.log("\n✅ Choonsim Setup Complete!");
    console.log(`Bond 101 is registered, audited, and has active holders.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
