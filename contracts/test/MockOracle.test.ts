import { expect } from "chai";
import { ethers } from "hardhat";
import { YieldDistributor, BondToken, MockUSDC, LiquidityPool, MockOracle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MockOracle (Integration)", function () {
    let yieldDistributor: YieldDistributor;
    let bondToken: BondToken;
    let usdcToken: MockUSDC;
    let liquidityPool: LiquidityPool;
    let mockOracle: MockOracle;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let oracleNode: SignerWithAddress;

    const BOND_ID = 1;

    beforeEach(async function () {
        [owner, user1, oracleNode] = await ethers.getSigners();

        // 1. Deploy Core Contracts
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

        // 2. Deploy MockOracle
        const MockOracleFactory = await ethers.getContractFactory("MockOracle");
        mockOracle = await MockOracleFactory.deploy(
            await yieldDistributor.getAddress(),
            await usdcToken.getAddress()
        ) as unknown as MockOracle;

        // 3. Setup Relationships
        await bondToken.setYieldDistributor(await yieldDistributor.getAddress());
        await yieldDistributor.setBondToken(await bondToken.getAddress());
        await yieldDistributor.registerBond(BOND_ID);

        // 4. Grant Roles
        const MINTER_ROLE = await bondToken.MINTER_ROLE();
        await bondToken.grantRole(MINTER_ROLE, await liquidityPool.getAddress());

        const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
        await yieldDistributor.grantRole(DISTRIBUTOR_ROLE, await mockOracle.getAddress());

        const ORACLE_DISTRIBUTOR_ROLE = await mockOracle.DISTRIBUTOR_ROLE();
        await mockOracle.grantRole(ORACLE_DISTRIBUTOR_ROLE, oracleNode.address);

        // 5. Fund User1 for investment
        const INITIAL_USDC = ethers.parseUnits("1000", 18);
        await usdcToken.mint(user1.address, INITIAL_USDC);
        await usdcToken.connect(user1).approve(await liquidityPool.getAddress(), INITIAL_USDC);

        // 6. User1 invests
        await liquidityPool.connect(user1).purchaseBond(BOND_ID, ethers.parseUnits("100", 18));
    });

    it("Should distribute yield via MockOracle correctly", async function () {
        const yieldAmount = ethers.parseUnits("50", 18);

        // Oracle Node needs USDC to distribute
        await usdcToken.mint(oracleNode.address, yieldAmount);
        await usdcToken.connect(oracleNode).approve(await mockOracle.getAddress(), yieldAmount);

        // Trigger yield distribution through Oracle
        await expect(mockOracle.connect(oracleNode).setAssetData(BOND_ID, yieldAmount))
            .to.emit(mockOracle, "AssetDataUpdated")
            .withArgs(BOND_ID, yieldAmount)
            .and.to.emit(yieldDistributor, "YieldDeposited")
            .withArgs(BOND_ID, yieldAmount);

        // Check if User1 accrued the yield
        expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(yieldAmount);
    });

    it("Should fail if unauthorized user tries to set asset data", async function () {
        const yieldAmount = ethers.parseUnits("50", 18);
        await expect(mockOracle.connect(user1).setAssetData(BOND_ID, yieldAmount))
            .to.be.revertedWithCustomError(mockOracle, "AccessControlUnauthorizedAccount");
    });

    it("Should fail if MockOracle doesn't have DISTRIBUTOR_ROLE on YieldDistributor", async function () {
        const yieldAmount = ethers.parseUnits("50", 18);

        // Revoke role
        const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
        await yieldDistributor.revokeRole(DISTRIBUTOR_ROLE, await mockOracle.getAddress());

        await usdcToken.mint(oracleNode.address, yieldAmount);
        await usdcToken.connect(oracleNode).approve(await mockOracle.getAddress(), yieldAmount);

        await expect(mockOracle.connect(oracleNode).setAssetData(BOND_ID, yieldAmount))
            .to.be.revertedWithCustomError(yieldDistributor, "AccessControlUnauthorizedAccount");
    });
});
