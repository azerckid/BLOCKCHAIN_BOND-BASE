import { expect } from "chai";
import { ethers } from "hardhat";
import { LiquidityPool, BondToken, MockUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LiquidityPool", function () {
    let liquidityPool: LiquidityPool;
    let bondToken: BondToken;
    let usdcToken: MockUSDC;
    let owner: SignerWithAddress;
    let investor: SignerWithAddress;
    let borrower: SignerWithAddress;

    const BOND_ID = 1;
    const INVEST_AMOUNT = ethers.parseUnits("1000", 18); // 1000 USDC

    beforeEach(async function () {
        [owner, investor, borrower] = await ethers.getSigners();

        // Deploy Mock USDC
        const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
        usdcToken = await MockUSDCFactory.deploy() as unknown as MockUSDC;

        // Deploy BondToken
        const BondTokenFactory = await ethers.getContractFactory("BondToken");
        bondToken = await BondTokenFactory.deploy() as unknown as BondToken;

        // Deploy LiquidityPool
        const LiquidityPoolFactory = await ethers.getContractFactory("LiquidityPool");
        liquidityPool = await LiquidityPoolFactory.deploy(
            await usdcToken.getAddress(),
            await bondToken.getAddress()
        ) as unknown as LiquidityPool;

        // Grant MINTER_ROLE to LiquidityPool
        const MINTER_ROLE = await bondToken.MINTER_ROLE();
        await bondToken.grantRole(MINTER_ROLE, await liquidityPool.getAddress());

        // Fund investor with USDC
        await usdcToken.mint(investor.address, INVEST_AMOUNT);
    });

    describe("Investment", function () {
        it("Should fail if amount is 0", async function () {
            await expect(
                liquidityPool.connect(investor).purchaseBond(BOND_ID, 0)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should fail if USDC is not approved", async function () {
            await expect(
                liquidityPool.connect(investor).purchaseBond(BOND_ID, INVEST_AMOUNT)
            ).to.be.reverted; // ERC20 insufficient allowance
        });

        it("Should allow investment after approval", async function () {
            // Approve LiquidityPool to spend investor's USDC
            await usdcToken.connect(investor).approve(await liquidityPool.getAddress(), INVEST_AMOUNT);

            // Invest
            await expect(liquidityPool.connect(investor).purchaseBond(BOND_ID, INVEST_AMOUNT))
                .to.emit(liquidityPool, "BondPurchased")
                .withArgs(investor.address, BOND_ID, INVEST_AMOUNT);

            // Check Balances
            expect(await usdcToken.balanceOf(investor.address)).to.equal(0);
            expect(await usdcToken.balanceOf(await liquidityPool.getAddress())).to.equal(INVEST_AMOUNT);
            expect(await bondToken.balanceOf(investor.address, BOND_ID)).to.equal(INVEST_AMOUNT);
        });
    });

    describe("Withdrawal", function () {
        beforeEach(async function () {
            // Setup: Investor invests first
            await usdcToken.connect(investor).approve(await liquidityPool.getAddress(), INVEST_AMOUNT);
            await liquidityPool.connect(investor).purchaseBond(BOND_ID, INVEST_AMOUNT);
        });

        it("Should allow admin to withdraw funds", async function () {
            const initialBorrowerBalance = await usdcToken.balanceOf(borrower.address);

            await expect(liquidityPool.withdrawFunds(borrower.address, INVEST_AMOUNT))
                .to.emit(liquidityPool, "FundsWithdrawn")
                .withArgs(borrower.address, INVEST_AMOUNT);

            expect(await usdcToken.balanceOf(borrower.address)).to.equal(initialBorrowerBalance + INVEST_AMOUNT);
            expect(await usdcToken.balanceOf(await liquidityPool.getAddress())).to.equal(0);
        });

        it("Should fail if non-admin tries to withdraw", async function () {
            await expect(
                liquidityPool.connect(investor).withdrawFunds(investor.address, INVEST_AMOUNT)
            ).to.be.revertedWithCustomError(liquidityPool, "AccessControlUnauthorizedAccount");
        });
    });

    describe("Pausable", function () {
        it("Should allow admin to pause and unpause", async function () {
            await liquidityPool.pause();
            expect(await liquidityPool.paused()).to.be.true;
            await liquidityPool.unpause();
            expect(await liquidityPool.paused()).to.be.false;
        });

        it("Should revert purchaseBond when paused", async function () {
            await liquidityPool.pause();
            await usdcToken.connect(investor).approve(await liquidityPool.getAddress(), INVEST_AMOUNT);
            await expect(
                liquidityPool.connect(investor).purchaseBond(BOND_ID, INVEST_AMOUNT)
            ).to.be.revertedWithCustomError(liquidityPool, "EnforcedPause");
            await liquidityPool.unpause();
        });

        it("Should revert withdrawFunds when paused", async function () {
            await usdcToken.connect(investor).approve(await liquidityPool.getAddress(), INVEST_AMOUNT);
            await liquidityPool.connect(investor).purchaseBond(BOND_ID, INVEST_AMOUNT);
            await liquidityPool.pause();
            await expect(
                liquidityPool.withdrawFunds(borrower.address, INVEST_AMOUNT)
            ).to.be.revertedWithCustomError(liquidityPool, "EnforcedPause");
        });
    });
});
