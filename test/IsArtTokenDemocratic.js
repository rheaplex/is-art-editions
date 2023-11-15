/* global expect require */

const testErc721 = require("../lib/testErc721.js");

const NUM_TOKENS = 16;
const THRESHOLD = 8;
const PERCENTAGE = 6.25;
const IsArtTokenDemocratic = artifacts.require("IsArtTokenDemocratic");

contract("IsArtTokenDemocratic", (accounts) => {
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenDemocratic,
      "Is Art (Token, Democratic)",
      "ISATD",
      NUM_TOKENS
    );

    const isArtTokenDemocratic = await IsArtTokenDemocratic.deployed();

    expect((await isArtTokenDemocratic.threshold()).toNumber())
      .to.equal(THRESHOLD);
    expect(await isArtTokenDemocratic.tokenIdIsArt(1)).to.equal(false);
    expect(await isArtTokenDemocratic.tokenIsArt()) .to.equal(false);
  });

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenDemocratic
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenDemocratic
  ));

  it("Should allow owner to toggle state", async function () {
    const isArtTokenDemocratic = await IsArtTokenDemocratic.deployed();
    const tokenId = 2;
    await isArtTokenDemocratic.toggle(tokenId);
    expect(await isArtTokenDemocratic.tokenIdIsArt(tokenId)).to.equal(true);
    await isArtTokenDemocratic.toggle(tokenId);
    expect(await isArtTokenDemocratic.tokenIdIsArt(tokenId)).to.equal(false);
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenDemocratic = await IsArtTokenDemocratic.deployed();
    const tokenId = 3;
    let result = await isArtTokenDemocratic.toggle(tokenId);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Toggled");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(tokenId);
    expect(result.logs[0].args.isState).to.equal(true);
    expect(result.logs[0].args.isCount.toNumber()).to.equal(1);
    expect(result.logs[0].args.isPercentage.toNumber())
      .to.equal(Math.floor(1 * PERCENTAGE));
    expect(result.logs[0].args.isContractArt).to.equal(false);
    result = await isArtTokenDemocratic.toggle(tokenId);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Toggled");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(tokenId);
    expect(result.logs[0].args.isState).to.equal(false);
    expect(result.logs[0].args.isCount.toNumber()).to.equal(0);
    expect(result.logs[0].args.isContractArt).to.equal(false);
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenDemocratic = await IsArtTokenDemocratic.deployed();

    try {
      await isArtTokenDemocratic.toggle(5, { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
      }
  });

  it("Should track state correctly", async function () {
    const isArtTokenDemocratic = await IsArtTokenDemocratic.deployed();
    for (let i = 1; i <= 10; i++) {
      // Avoid any test transfers
      const tokenId = i + 5;
      await isArtTokenDemocratic.toggle(tokenId);
      expect(await isArtTokenDemocratic.tokenIsArt())
        .to.equal(i >= THRESHOLD);
      expect((await isArtTokenDemocratic.tokenIsArtPercentage()).toNumber())
        .to.equal(Math.floor(i * PERCENTAGE));
    }
    for (let i = 10; i >= 1; i--) {
      const tokenId = i + 5;
      await isArtTokenDemocratic.toggle(tokenId);
      expect(await isArtTokenDemocratic.tokenIsArt())
        .to.equal(i > THRESHOLD);
      // Note the - 1 as we go back down.
      expect((await isArtTokenDemocratic.tokenIsArtPercentage()).toNumber())
        .to.equal(Math.floor((i - 1) * PERCENTAGE));
    }
  });

});
