import { expect } from "chai";
import { ethers } from "hardhat";
import { YieldDistributor, BondToken, MockUSDC, LiquidityPool, OracleAdapter } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("OracleAdapter (Integration)", function () {
    let yieldDistributor: YieldDistributor;
    let bondToken: BondToken;
    let usdcToken: MockUSDC;
    let liquidityPool: LiquidityPool;
    let oracleAdapter: OracleAdapter;
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

        // 2. Deploy OracleAdapter
        const OracleAdapterFactory = await ethers.getContractFactory("OracleAdapter");
        oracleAdapter = await OracleAdapterFactory.deploy(
            await yieldDistributor.getAddress(),
            await usdcToken.getAddress()
        ) as unknown as OracleAdapter;

        // 3. Setup Relationships
        await bondToken.setYieldDistributor(await yieldDistributor.getAddress());
        await yieldDistributor.setBondToken(await bondToken.getAddress());
        await yieldDistributor.registerBond(BOND_ID);

        // 4. Grant Roles
        const MINTER_ROLE = await bondToken.MINTER_ROLE();
        await bondToken.grantRole(MINTER_ROLE, await liquidityPool.getAddress());

        const DISTRIBUTOR_ROLE = await yieldDistributor.DISTRIBUTOR_ROLE();
        await yieldDistributor.grantRole(DISTRIBUTOR_ROLE, await oracleAdapter.getAddress());

        const ORACLE_ROLE = await oracleAdapter.ORACLE_ROLE();
        await oracleAdapter.grantRole(ORACLE_ROLE, oracleNode.address);

        // 5. Fund User1 for investment
        const INITIAL_USDC = ethers.parseUnits("1000", 18);
        await usdcToken.mint(user1.address, INITIAL_USDC);
        await usdcToken.connect(user1).approve(await liquidityPool.getAddress(), INITIAL_USDC);

        // 6. User1 invests
        await liquidityPool.connect(user1).purchaseBond(BOND_ID, ethers.parseUnits("100", 18));
    });

    it("Should record asset performance and distribute yield correctly", async function () {
        const principalAmount = ethers.parseUnits("1000", 18);
        const interestAmount = ethers.parseUnits("50", 18);
        const latestBlock = await ethers.provider.getBlock("latest");
        const timestamp = (latestBlock?.timestamp || 0) + 1;
        const proof = "ipfs://QmProof";

        const performanceData = {
            timestamp: timestamp,
            principalPaid: principalAmount,
            interestPaid: interestAmount,
            status: 0, // Active
            verifyProof: proof
        };

        const impactData = {
            carbonReduced: 100,
            jobsCreated: 5,
            smeSupported: 2,
            reportUrl: "https://rwa-report.com/1"
        };

        // Oracle Node needs USDC to distribute interest
        await usdcToken.mint(oracleNode.address, interestAmount);
        await usdcToken.connect(oracleNode).approve(await oracleAdapter.getAddress(), interestAmount);

        // Update status through OracleAdapter
        await expect(oracleAdapter.connect(oracleNode).updateAssetStatus(BOND_ID, performanceData, impactData))
            .to.emit(oracleAdapter, "AssetStatusUpdated")
            .withArgs(BOND_ID, principalAmount, interestAmount, 0, proof, 100, 5, 2)
            .and.to.emit(yieldDistributor, "YieldDeposited")
            .withArgs(BOND_ID, interestAmount);

        // Verify storage
        const storedData = await oracleAdapter.getAssetPerformance(BOND_ID);
        expect(storedData.principalPaid).to.equal(principalAmount);
        expect(storedData.interestPaid).to.equal(interestAmount);
        expect(storedData.verifyProof).to.equal(proof);

        // Check if User1 accrued the yield
        expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(interestAmount);
    });

    it("Should only distribute NEW interest paid", async function () {
        const principalAmount = ethers.parseUnits("1000", 18);
        const initialInterest = ethers.parseUnits("50", 18);
        const initialBlock = await ethers.provider.getBlock("latest");
        const initialTimestamp = (initialBlock?.timestamp || 0) + 1;

        // 1st update
        await usdcToken.mint(oracleNode.address, initialInterest);
        await usdcToken.connect(oracleNode).approve(await oracleAdapter.getAddress(), initialInterest);
        await oracleAdapter.connect(oracleNode).updateAssetStatus(BOND_ID, {
            timestamp: initialTimestamp,
            principalPaid: principalAmount,
            interestPaid: initialInterest,
            status: 0,
            verifyProof: "proof1"
        }, {
            carbonReduced: 50,
            jobsCreated: 2,
            smeSupported: 1,
            reportUrl: ""
        });

        // 2nd update with additional interest
        const additionalInterest = ethers.parseUnits("30", 18);
        const totalInterest = initialInterest + additionalInterest;
        const latestBlock = await ethers.provider.getBlock("latest");
        const nextTimestamp = (latestBlock?.timestamp || 0) + 1;

        await usdcToken.mint(oracleNode.address, additionalInterest);
        await usdcToken.connect(oracleNode).approve(await oracleAdapter.getAddress(), additionalInterest);

        await expect(oracleAdapter.connect(oracleNode).updateAssetStatus(BOND_ID, {
            timestamp: nextTimestamp,
            principalPaid: principalAmount,
            interestPaid: totalInterest,
            status: 0,
            verifyProof: "proof2"
        }, {
            carbonReduced: 80,
            jobsCreated: 3,
            smeSupported: 1,
            reportUrl: ""
        }))
            .to.emit(yieldDistributor, "YieldDeposited")
            .withArgs(BOND_ID, additionalInterest);

        // Check cumulative accrual
        expect(await yieldDistributor.earned(user1.address, BOND_ID)).to.equal(totalInterest);
    });

    it("Should fail if unauthorized user tries to update asset status", async function () {
        const performanceData = {
            timestamp: 12345678,
            principalPaid: 0,
            interestPaid: 100,
            status: 0,
            verifyProof: ""
        };
        const impactData = {
            carbonReduced: 0,
            jobsCreated: 0,
            smeSupported: 0,
            reportUrl: ""
        };
        await expect(oracleAdapter.connect(user1).updateAssetStatus(BOND_ID, performanceData, impactData))
            .to.be.revertedWithCustomError(oracleAdapter, "AccessControlUnauthorizedAccount");
    });
});
