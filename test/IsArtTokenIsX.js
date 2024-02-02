/* global expect require */

const testErc721 = require("../lib/testErc721.js");

const IsArtTokenIsX = artifacts.require("IsArtTokenIsX");

const NUM_TOKENS = 16;

contract("IsArtTokenIsX", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenIsX,
      "Is Art (Token, Is X)",
      "ISATISX",
      NUM_TOKENS
    );

    const isArtTokenIsX = await IsArtTokenIsX.deployed();

    expect(await isArtTokenIsX.tokenIs(1))
      .to.equal("art");
  });

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenIsX
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenIsX
  ));

  it("Should allow owner to set definition", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    const tokenId = 3;
    await isArtTokenIsX.setIs(tokenId, 32);
    expect(await isArtTokenIsX.tokenIs(tokenId))
      .to.equal("nft art");
  });

  it("Should emit set definition events", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    const tokenId = 3;
    const result = await isArtTokenIsX.setIs(tokenId, 2);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Is");
    expect(result.logs[0].args.tokenid.toNumber()).to.equal(tokenId);
    expect(result.logs[0].args.token_is).to.equal("painting");
    // Make sure the state matches
    expect(await isArtTokenIsX.tokenIs(tokenId))
      .to.equal("painting");
  });

  it("Should not allow non-owner to set definition", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.setIs(1, 1, { from: other });
      expect.fail("Should fail! Only token holder can set definition.");
    } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can set definition");
      }
  });

  it("Should not allow owner to set invalid definition", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.setIs(1, 99);
      expect.fail("Should fail! Invalid definition property.");
    } catch (error) {
        expect(error.reason)
          .to.equal("Invalid is value");
      }
  });

});
