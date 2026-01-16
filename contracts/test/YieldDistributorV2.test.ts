import { expect } from "chai";
import { ethers } from "hardhat";
import { YieldDistributor, BondToken, MockUSDC, LiquidityPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("YieldDistributorV2 (Integrated System)", function () {
    let yieldDistributor: YieldDistributor;
    let bondToken: BondToken;
    let usdcToken: MockUSDC;
    let liquidityPool: LiquidityPool;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    const BOND_ID = 1;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // 1. Deploy Contracts
        const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
        usdcToken = await MockUSDCFactory.deploy() as unknown as MockUSDC;

        const BondTokenFactory = await ethers.getContractFactory("BondToken");
        bondToken = await BondTokenFactory.deploy() as unknown as BondToken;

        const YieldDistributorFactory = await ethers.getContractFactory("YieldDistributor");
        yieldDistributor = await YieldDistributorFactory.deploy(await usdcToken.getAddress()) as unknown as YieldDistributor;

        const LiquidityPoolFactory = await ethers.getContractFactory("LiquidityPool");
        liquidityPool = await LiquidityPoolFactory.deploy(
            await usdcToken.getAddress(),
            await bondToken.getAddress()
        ) as unknown as LiquidityPool;

        // 2. Setup Inter-contract Relationships
        await bondToken.setYieldDistributor(await yieldDistributor.getAddress());
        await yieldDistributor.setBondToken(await bondToken.getAddress());
        await yieldDistributor.registerBond(BOND_ID);

        // 3. Grant Roles
        const MINTER_ROLE = await bondToken.MINTER_ROLE();
        await bondToken.grantRole(MINTER_ROLE, await liquidityPool.getAddress());
        await bondToken.grantRole(MINTER_ROLE, await yieldDistributor.getAddress()); // Grant YieldDistributor minter role for reinvest

        await yieldDistributor.setLiquidityPool(await liquidityPool.getAddress()); // Set LP address

        // Owner also gets minter role for easy setup in tests if needed
        await bondToken.grantRole(MINTER_ROLE, owner.address);

        // 4. Fund Users
        const INITIAL_USDC = ethers.parseUnits("1000", 18);
        await usdcToken.mint(user1.address, INITIAL_USDC);
        await usdcToken.mint(user2.address, INITIAL_USDC);
        await usdcToken.connect(user1).approve(await liquidityPool.getAddress(), INITIAL_USDC);
        await usdcToken.connect(user2).approve(await liquidityPool.getAddress(), INITIAL_USDC);
    });

    describe("Purchase & Real-time Yield Accrual", function () {
        it("Should accurately track total holdings in YieldDistributor when user purchases bonds", async function () {
            const amount = ethers.parseUnits("100", 18);
            await liquidityPool.connect(user1).purchaseBond(BOND_ID, amount);

            const bondInfo = await yieldDistributor.bonds(BOND_ID);
            expect(bondInfo.totalHoldings).to.equal(amount);
            expect(await bondToken.balanceOf(user1.address, BOND_ID)).to.equal(amount);
        });

        it("Should accrue yield immediately after purchase and deposit", async function () {
            const amount = ethers.parseUnits("100", 18);
            await liquidityPool.connect(user1).purchaseBond(BOND_ID, amount);

            // Admin deposits yield
            const yieldAmount = ethers.parseUnits("50", 18);
            await usdcToken.mint(owner.address, yieldAmount);
            await usdcToken.approve(await yieldDistributor.getAddress(), yieldAmount);
            await yieldDistributor.depositYield(BOND_ID, yieldAmount);

            // User1 should have accrued the full yield (only holder)
            expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(yieldAmount);
        });

        it("Should handle proportional distribution for multiple holders", async function () {
            const amount1 = ethers.parseUnits("100", 18);
            const amount2 = ethers.parseUnits("300", 18);

            await liquidityPool.connect(user1).purchaseBond(BOND_ID, amount1);
            await liquidityPool.connect(user2).purchaseBond(BOND_ID, amount2);

            // Admin deposits 400 USDC
            const yieldAmount = ethers.parseUnits("400", 18);
            await usdcToken.mint(owner.address, yieldAmount);
            await usdcToken.approve(await yieldDistributor.getAddress(), yieldAmount);
            await yieldDistributor.depositYield(BOND_ID, yieldAmount);

            // User1 (1/4 share) -> 100 USDC
            // User2 (3/4 share) -> 300 USDC
            expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(ethers.parseUnits("100", 18));
            expect(await yieldDistributor.earned(user2.address, BOND_ID)).to.equal(ethers.parseUnits("300", 18));
        });
    });

    describe("Transfers & Checkpoints", function () {
        it("Should update rewards correctly on transfer between users", async function () {
            const amount = ethers.parseUnits("100", 18);
            await liquidityPool.connect(user1).purchaseBond(BOND_ID, amount);

            // Epoch 1: 100 USDC Yield
            const yield1 = ethers.parseUnits("100", 18);
            await usdcToken.mint(owner.address, yield1);
            await usdcToken.approve(await yieldDistributor.getAddress(), yield1);
            await yieldDistributor.depositYield(BOND_ID, yield1);

            // User1 transfers 50 to User2
            await bondToken.connect(user1).safeTransferFrom(user1.address, user2.address, BOND_ID, ethers.parseUnits("50", 18), "0x");

            // Epoch 2: 200 USDC Yield
            const yield2 = ethers.parseUnits("200", 18);
            await usdcToken.mint(owner.address, yield2);
            await usdcToken.approve(await yieldDistributor.getAddress(), yield2);
            await yieldDistributor.depositYield(BOND_ID, yield2);

            // Calculation:
            // User1: epoch1(100) + epoch2(200 * 50/100) = 100 + 100 = 200
            // User2: epoch1(0) + epoch2(200 * 50/100) = 0 + 100 = 100

            expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(ethers.parseUnits("200", 18));
            expect(await yieldDistributor.earned(user2.address, BOND_ID)).to.equal(ethers.parseUnits("100", 18));
        });
    });

    describe("Claiming", function () {
        it("Should allow user to claim yield", async function () {
            const amount = ethers.parseUnits("100", 18);
            await liquidityPool.connect(user1).purchaseBond(BOND_ID, amount);

            const yieldAmount = ethers.parseUnits("100", 18);
            await usdcToken.mint(owner.address, yieldAmount);
            await usdcToken.approve(await yieldDistributor.getAddress(), yieldAmount);
            await yieldDistributor.depositYield(BOND_ID, yieldAmount);

            const balanceBefore = await usdcToken.balanceOf(user1.address);
            await yieldDistributor.connect(user1).claimYield(BOND_ID);
            const balanceAfter = await usdcToken.balanceOf(user1.address);

            expect(balanceAfter - balanceBefore).to.equal(yieldAmount);
            expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(0);
        });
    });

    describe("Reinvesting", function () {
        it("Should allow user to reinvest yield into more bonds", async function () {
            const amount = ethers.parseUnits("100", 18);
            await liquidityPool.connect(user1).purchaseBond(BOND_ID, amount);

            // 100 USDC Yield
            const yieldAmount = ethers.parseUnits("100", 18);
            await usdcToken.mint(owner.address, yieldAmount);
            await usdcToken.approve(await yieldDistributor.getAddress(), yieldAmount);
            await yieldDistributor.depositYield(BOND_ID, yieldAmount);

            // Expect earned to be 100
            expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(yieldAmount);

            // Reinvest
            // Should transfer 100 USDC to Liquidity Pool and Mint 100 BondTokens to User1
            const lpBalanceBefore = await usdcToken.balanceOf(await liquidityPool.getAddress());
            await yieldDistributor.connect(user1).reinvest(BOND_ID);
            const lpBalanceAfter = await usdcToken.balanceOf(await liquidityPool.getAddress());

            // Check LP received funds
            expect(lpBalanceAfter - lpBalanceBefore).to.equal(yieldAmount);

            // Check User received more bonds (100 + 100 = 200)
            expect(await bondToken.balanceOf(user1.address, BOND_ID)).to.equal(amount + yieldAmount);

            // Check Earned reset
            expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(0);
        });
    });
});
