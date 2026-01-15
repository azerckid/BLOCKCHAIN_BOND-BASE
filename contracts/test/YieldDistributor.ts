import { expect } from "chai";
import { ethers } from "hardhat";
import { YieldDistributor, BondToken, MockUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("YieldDistributor", function () {
    let yieldDistributor: YieldDistributor;
    let bondToken: BondToken;
    let usdcToken: MockUSDC;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    const BOND_ID = 1;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // 1. Deploy Tokens
        const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
        usdcToken = await MockUSDCFactory.deploy() as unknown as MockUSDC;

        const BondTokenFactory = await ethers.getContractFactory("BondToken");
        bondToken = await BondTokenFactory.deploy() as unknown as BondToken;

        // 2. Deploy Distributor
        const YieldDistributorFactory = await ethers.getContractFactory("YieldDistributor");
        yieldDistributor = await YieldDistributorFactory.deploy(
            await usdcToken.getAddress(),
            await bondToken.getAddress(),
            BOND_ID
        ) as unknown as YieldDistributor;

        // 3. Setup: Mint Bonds to Users
        const MINTER_ROLE = await bondToken.MINTER_ROLE();
        await bondToken.grantRole(MINTER_ROLE, owner.address); // Owner can mint for setup

        await bondToken.mint(user1.address, BOND_ID, 100, "", "0x"); // User1 gets 100
        await bondToken.mint(user2.address, BOND_ID, 100, "", "0x"); // User2 gets 100

        // 4. Setup: Approve Distributor to spend users' bonds (for staking)
        await bondToken.connect(user1).setApprovalForAll(await yieldDistributor.getAddress(), true);
        await bondToken.connect(user2).setApprovalForAll(await yieldDistributor.getAddress(), true);
    });

    describe("Staking", function () {
        it("Should allow users to stake bonds", async function () {
            await yieldDistributor.connect(user1).stake(100);
            expect(await bondToken.balanceOf(user1.address, BOND_ID)).to.equal(0);
            expect(await bondToken.balanceOf(await yieldDistributor.getAddress(), BOND_ID)).to.equal(100);
        });

        it("Should allow users to withdraw bonds", async function () {
            await yieldDistributor.connect(user1).stake(100);
            await yieldDistributor.connect(user1).withdraw(50);

            expect(await bondToken.balanceOf(user1.address, BOND_ID)).to.equal(50);
        });
    });

    describe("Yield Distribution", function () {
        const YIELD_AMOUNT = ethers.parseUnits("200", 18); // 200 USDC

        beforeEach(async function () {
            // Owner mints USDC to self to distribute yield
            await usdcToken.mint(owner.address, YIELD_AMOUNT);
            await usdcToken.approve(await yieldDistributor.getAddress(), YIELD_AMOUNT);
        });

        it("Should fail deposit if no one staked", async function () {
            await expect(
                yieldDistributor.depositYield(YIELD_AMOUNT)
            ).to.be.revertedWith("No tokens staked");
        });

        it("Should distribute yield correctly to single staker", async function () {
            await yieldDistributor.connect(user1).stake(100);

            await yieldDistributor.depositYield(YIELD_AMOUNT);

            // User1 should have 200 USDC earned
            expect(await yieldDistributor.earned(user1.address)).to.equal(YIELD_AMOUNT);

            // Claim
            await yieldDistributor.connect(user1).claimYield();
            expect(await usdcToken.balanceOf(user1.address)).to.equal(YIELD_AMOUNT);
            expect(await yieldDistributor.earned(user1.address)).to.equal(0);
        });

        it("Should distribute yield proportionally to multiple stakers", async function () {
            // User1 stakes 100, User2 stakes 100. Total 200.
            await yieldDistributor.connect(user1).stake(100);
            await yieldDistributor.connect(user2).stake(100);

            // Deposit 200 USDC
            await yieldDistributor.depositYield(YIELD_AMOUNT);

            // Each should get 100 USDC (50% share)
            const expectedShare = ethers.parseUnits("100", 18);

            expect(await yieldDistributor.earned(user1.address)).to.equal(expectedShare);
            expect(await yieldDistributor.earned(user2.address)).to.equal(expectedShare);

            await yieldDistributor.connect(user1).claimYield();
            expect(await usdcToken.balanceOf(user1.address)).to.equal(expectedShare);
        });

        it("Should handle dynamic staking (joining mid-epoch)", async function () {
            // User1 stakes 100
            await yieldDistributor.connect(user1).stake(100);

            // Distribute 100 USDC. User1 gets 100.
            const reward1 = ethers.parseUnits("100", 18);
            await usdcToken.mint(owner.address, reward1);
            await usdcToken.approve(await yieldDistributor.getAddress(), reward1);
            await yieldDistributor.depositYield(reward1);

            // User2 joins now with 100 stakes. Total 200.
            await yieldDistributor.connect(user2).stake(100);

            // Distribute another 100 USDC. User1 gets 50, User2 gets 50.
            const reward2 = ethers.parseUnits("100", 18);
            await usdcToken.mint(owner.address, reward2);
            await usdcToken.approve(await yieldDistributor.getAddress(), reward2);
            await yieldDistributor.depositYield(reward2);

            // Verify User1 total: 100 (1st) + 50 (2nd) = 150
            expect(await yieldDistributor.earned(user1.address)).to.equal(ethers.parseUnits("150", 18));

            // Verify User2 total: 0 (1st) + 50 (2nd) = 50
            expect(await yieldDistributor.earned(user2.address)).to.equal(ethers.parseUnits("50", 18));
        });
    });
});
