import { expect } from "chai";
import { ethers } from "hardhat";
import { YieldDistributor, ChoonsimBond, MockUSDC, LiquidityPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ChoonsimBond Integration (RWA Growth Model)", function () {
    let yieldDistributor: YieldDistributor;
    let choonsimBond: ChoonsimBond;
    let usdcToken: MockUSDC;
    let liquidityPool: LiquidityPool;
    let owner: SignerWithAddress;
    let fan1: SignerWithAddress;
    let fan2: SignerWithAddress;

    const CHOONSIM_BOND_ID = 101; // Specific ID for Choonsim Growth Bond

    beforeEach(async function () {
        [owner, fan1, fan2] = await ethers.getSigners();

        // 1. Deploy Contracts
        const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
        usdcToken = await MockUSDCFactory.deploy() as unknown as MockUSDC;

        const ChoonsimBondFactory = await ethers.getContractFactory("ChoonsimBond");
        choonsimBond = await ChoonsimBondFactory.deploy() as unknown as ChoonsimBond;

        const YieldDistributorFactory = await ethers.getContractFactory("YieldDistributor");
        yieldDistributor = await YieldDistributorFactory.deploy(await usdcToken.getAddress()) as unknown as YieldDistributor;

        const LiquidityPoolFactory = await ethers.getContractFactory("LiquidityPool");
        liquidityPool = await LiquidityPoolFactory.deploy(
            await usdcToken.getAddress(),
            await choonsimBond.getAddress()
        ) as unknown as LiquidityPool;

        // 2. Setup Relationships
        await choonsimBond.setYieldDistributor(await yieldDistributor.getAddress());
        await yieldDistributor.setBondToken(await choonsimBond.getAddress());
        await yieldDistributor.registerBond(CHOONSIM_BOND_ID);

        // 3. Grant Roles
        const MINTER_ROLE = await choonsimBond.MINTER_ROLE();
        await choonsimBond.grantRole(MINTER_ROLE, await liquidityPool.getAddress());
        await yieldDistributor.setLiquidityPool(await liquidityPool.getAddress());

        // 4. Fund Fans with USDC
        const initialFunds = ethers.parseUnits("1000", 18);
        await usdcToken.mint(fan1.address, initialFunds);
        await usdcToken.mint(fan2.address, initialFunds);
        await usdcToken.connect(fan1).approve(await liquidityPool.getAddress(), initialFunds);
        await usdcToken.connect(fan2).approve(await liquidityPool.getAddress(), initialFunds);
    });

    describe("Milestone Tracking", function () {
        it("Should allow admin to set and reach milestones", async function () {
            await choonsimBond.setMilestone("Twitter_Followers_50K", "Reach 50,000 followers on X", 50000);

            let milestone = await choonsimBond.milestones("Twitter_Followers_50K");
            expect(milestone.description).to.equal("Reach 50,000 followers on X");
            expect(milestone.achieved).to.be.false;

            await expect(choonsimBond.reachMilestone("Twitter_Followers_50K"))
                .to.emit(choonsimBond, "MilestoneAchieved")
                .withArgs("Twitter_Followers_50K", "Reach 50,000 followers on X", anyValue => true);

            milestone = await choonsimBond.milestones("Twitter_Followers_50K");
            expect(milestone.achieved).to.be.true;
        });
    });

    describe("Revenue & Milestone Yield Distribution", function () {
        it("Should distribute subscription revenue and milestone bonuses accurately", async function () {
            // 1. Fans invest in Choonsim Growth Bond
            const investment1 = ethers.parseUnits("100", 18);
            const investment2 = ethers.parseUnits("300", 18);
            await liquidityPool.connect(fan1).purchaseBond(CHOONSIM_BOND_ID, investment1);
            await liquidityPool.connect(fan2).purchaseBond(CHOONSIM_BOND_ID, investment2);

            // 2. Scenario: End of month subscription revenue deposit (400 USDC)
            const subRevenue = ethers.parseUnits("400", 18);
            await usdcToken.mint(owner.address, subRevenue);
            await usdcToken.approve(await yieldDistributor.getAddress(), subRevenue);
            await yieldDistributor.depositYield(CHOONSIM_BOND_ID, subRevenue);

            // Fan1 (25% share) -> 100 USDC, Fan2 (75% share) -> 300 USDC
            expect(await yieldDistributor.earned(fan1.address, CHOONSIM_BOND_ID)).to.equal(ethers.parseUnits("100", 18));
            expect(await yieldDistributor.earned(fan2.address, CHOONSIM_BOND_ID)).to.equal(ethers.parseUnits("300", 18));

            // 3. Scenario: Milestone "Japan Launch" reached + Bonus Deposit (200 USDC)
            await choonsimBond.setMilestone("Japan_Launch", "Official launch in Japan", 1);
            await choonsimBond.reachMilestone("Japan_Launch");

            const milestoneBonus = ethers.parseUnits("200", 18);
            await usdcToken.mint(owner.address, milestoneBonus);
            await usdcToken.approve(await yieldDistributor.getAddress(), milestoneBonus);
            await yieldDistributor.depositYield(CHOONSIM_BOND_ID, milestoneBonus);

            // Total Earned: Fan1 = 100 + (200 * 0.25) = 150, Fan2 = 300 + (200 * 0.75) = 450
            expect(await yieldDistributor.earned(fan1.address, CHOONSIM_BOND_ID)).to.equal(ethers.parseUnits("150", 18));
            expect(await yieldDistributor.earned(fan2.address, CHOONSIM_BOND_ID)).to.equal(ethers.parseUnits("450", 18));

            await yieldDistributor.connect(fan1).claimYield(CHOONSIM_BOND_ID);
            expect(await usdcToken.balanceOf(fan1.address)).to.equal(ethers.parseUnits("1050", 18)); // 900 left + 150 yield
        });

        it("Should hold yield in pending status until Oracle verifies (Zero-Trust)", async function () {
            // 1. Enable Audit Requirement
            await yieldDistributor.setAuditRequirement(CHOONSIM_BOND_ID, true);

            // 2. Fans invest
            const investment = ethers.parseUnits("100", 18);
            await liquidityPool.connect(fan1).purchaseBond(CHOONSIM_BOND_ID, investment);

            // 3. Deposit Revenue (100 USDC)
            const revenue = ethers.parseUnits("100", 18);
            await usdcToken.mint(owner.address, revenue);
            await usdcToken.approve(await yieldDistributor.getAddress(), revenue);

            await expect(yieldDistributor.depositYield(CHOONSIM_BOND_ID, revenue))
                .to.emit(yieldDistributor, "YieldPending")
                .withArgs(CHOONSIM_BOND_ID, revenue);

            // 4. Verification: Earned should be 0 because it's still pending
            expect(await yieldDistributor.earned(fan1.address, CHOONSIM_BOND_ID)).to.equal(0);

            // 5. Oracle Verifies
            await expect(yieldDistributor.verifyYield(CHOONSIM_BOND_ID, revenue))
                .to.emit(yieldDistributor, "YieldVerified")
                .withArgs(CHOONSIM_BOND_ID, revenue);

            // 6. Now fan should earned 100 USDC (100% share)
            expect(await yieldDistributor.earned(fan1.address, CHOONSIM_BOND_ID)).to.equal(revenue);
        });
    });
});
