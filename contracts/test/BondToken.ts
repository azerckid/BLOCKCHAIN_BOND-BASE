import { expect } from "chai";
import { ethers } from "hardhat";
import { BondToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BondToken", function () {
    let bondToken: BondToken;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const BondTokenFactory = await ethers.getContractFactory("BondToken");
        bondToken = await BondTokenFactory.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await bondToken.owner()).to.equal(owner.address);
        });
    });

    describe("Minting", function () {
        const TOKEN_ID = 1;
        const AMOUNT = 1000;
        const TOKEN_URI = "https://example.com/bond/1";

        it("Should allow owner to mint tokens with URI", async function () {
            await bondToken.mint(addr1.address, TOKEN_ID, AMOUNT, TOKEN_URI, "0x");

            expect(await bondToken.balanceOf(addr1.address, TOKEN_ID)).to.equal(AMOUNT);
            expect(await bondToken.uri(TOKEN_ID)).to.equal(TOKEN_URI);
        });

        it("Should fail if non-owner tries to mint", async function () {
            await expect(
                bondToken.connect(addr1).mint(addr2.address, TOKEN_ID, AMOUNT, TOKEN_URI, "0x")
            ).to.be.revertedWithCustomError(bondToken, "OwnableUnauthorizedAccount");
        });

        it("Should track total supply correctly", async function () {
            await bondToken.mint(addr1.address, TOKEN_ID, AMOUNT, TOKEN_URI, "0x");
            expect(await bondToken.getFunction("totalSupply(uint256)")(TOKEN_ID)).to.equal(AMOUNT);

            await bondToken.mint(addr2.address, TOKEN_ID, 500, "", "0x");
            expect(await bondToken.getFunction("totalSupply(uint256)")(TOKEN_ID)).to.equal(AMOUNT + 500);
        });
    });

    describe("URI Management", function () {
        const TOKEN_ID = 42;
        const BASE_URI = "https://api.buildctc.com/metadata/{id}.json";

        it("Should return base URI if token URI is not set", async function () {
            await bondToken.setURI(BASE_URI);
            expect(await bondToken.uri(TOKEN_ID)).to.equal(BASE_URI);
        });

        it("Should allow owner to update token URI", async function () {
            const NEW_URI = "ipfs://QmBondMetadata";
            await bondToken.mint(addr1.address, TOKEN_ID, 1, "", "0x");
            await bondToken.setTokenURI(TOKEN_ID, NEW_URI);
            expect(await bondToken.uri(TOKEN_ID)).to.equal(NEW_URI);
        });
    });
});
