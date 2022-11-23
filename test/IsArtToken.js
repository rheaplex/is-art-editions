require("@nomiclabs/hardhat-ethers");

const { expect } = require("chai");
const hre = require("hardhat");


describe("IsArttoken", function () {
  it("Should initialize contract state correctly", async function () {
    const IsArtToken = await hre.ethers.getContractFactory("IsArtToken");
    const isArtToken = await IsArtToken.deploy();
    const [owner, otherAccount] = await ethers.getSigners();
    const NUM_TOKENS = await isArtToken.NUM_TOKENS();
    
    expect(NUM_TOKENS).to.equal(16);
    expect(await isArtToken.name()).to.equal("Is Art (Token)");
    expect(await isArtToken.symbol()).to.equal("ISAT");
    
    expect(NUM_TOKENS).to.equal(await isArtToken.balanceOf(owner.address));
    
    for (let i = 1; i <= NUM_TOKENS; i++) {
      expect(ethers.utils.toUtf8String(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should allow owner to toggle state", async function () {
    const IsArtToken = await hre.ethers.getContractFactory("IsArtToken");
    const isArtToken = await IsArtToken.deploy();
    const [owner, otherAccount] = await ethers.getSigners();
    const NUM_TOKENS = await isArtToken.NUM_TOKENS();
    
    for (let i = 1; i <= NUM_TOKENS; i++) {
      await isArtToken.toggle(i);
      expect(ethers.utils.toUtf8String(await isArtToken.tokenIsArt(i)))
        .to.equal("is\0\0\0\0");
    }

    for (let i = 1; i <= NUM_TOKENS; i++) {
      await isArtToken.toggle(i);
      expect(ethers.utils.toUtf8String(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should emit toggle status events", async function () {
    const IsArtToken = await hre.ethers.getContractFactory("IsArtToken");
    const isArtToken = await IsArtToken.deploy();
    const [owner, otherAccount] = await ethers.getSigners();
    const NUM_TOKENS = await isArtToken.NUM_TOKENS();
    
    for (let i = 1; i <= NUM_TOKENS; i++) {
      expect(await isArtToken.toggle(i))
        .to.emit(isArtToken, "Status")
        .withArgs(i, "is\0\0\0\0");
      // Make sure the state matches
      expect(ethers.utils.toUtf8String(await isArtToken.tokenIsArt(i)))
        .to.equal("is\0\0\0\0");
    }

    for (let i = 1; i <= NUM_TOKENS; i++) {
      expect(await isArtToken.toggle(i))
        .to.emit(isArtToken, "Status")
        .withArgs(i, "is not");
      // Make sure the state matches
      expect(ethers.utils.toUtf8String(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should not allow non-owner to toggle state", async function () {
    const IsArtToken = await hre.ethers.getContractFactory("IsArtToken");
    const isArtToken = await IsArtToken.deploy();
    const [owner, otherAccount] = await ethers.getSigners();
    const NUM_TOKENS = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= NUM_TOKENS; i++) {
      await expect(isArtToken.connect(otherAccount).toggle(i))
        .to.be.revertedWith("Only token holder can toggle state");
    }
  });

  it("Should allow owner to transfer", async function () {
    const IsArtToken = await hre.ethers.getContractFactory("IsArtToken");
    const isArtToken = await IsArtToken.deploy();
    const [owner, otherAccount] = await ethers.getSigners();
    const NUM_TOKENS = await isArtToken.NUM_TOKENS();
    
    for (let i = 1; i <= NUM_TOKENS; i++) {
      await isArtToken.transferFrom(owner.address, otherAccount.address, i);
      expect(await isArtToken.ownerOf(i))
        .to.equal(otherAccount.address);
    }

    for (let i = 1; i <= NUM_TOKENS; i++) {
      await isArtToken.connect(otherAccount)
        .transferFrom(otherAccount.address, owner.address, i);
      expect(await isArtToken.ownerOf(i))
        .to.equal(owner.address);
    }
  });

  it("Should not allow non-owner to transfer", async function () {
    const IsArtToken = await hre.ethers.getContractFactory("IsArtToken");
    const isArtToken = await IsArtToken.deploy();
    const [owner, otherAccount] = await ethers.getSigners();
    const NUM_TOKENS = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= NUM_TOKENS; i++) {
      await expect(isArtToken.connect(otherAccount).transferFrom(
        owner.address,
        otherAccount.address,
        i
      )).to.be.revertedWith("ERC721: caller is not token owner nor approved");
    }
  });

});
