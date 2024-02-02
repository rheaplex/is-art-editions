/* global expect require */

const testErc721 = require("../lib/testErc721.js");

const IsArtTokenBecause = artifacts.require("IsArtTokenBecause");

const NUM_TOKENS = 16;

contract("IsArtTokenBecause", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenBecause,
      "Is Art (Token, Because)",
      "ISATB",
      NUM_TOKENS
    );

    const isArtTokenBecause = await IsArtTokenBecause.deployed();

    expect(await isArtTokenBecause.getDefinitionText(1))
      .to.equal("This token is art because it powerfully engages with negative specificity");
    expect(await isArtTokenBecause.getDefinitionData(1))
      .to.deep.equal([
        "0x0000000000000000000000000000000000000000",
        "0",
        "0",
        "0",
        "0"
      ]);
  });

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenBecause
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenBecause
  ));

  it("Should allow owner to set definition", async function () {
    const isArtTokenBecause = await IsArtTokenBecause.deployed();
    const tokenId = 3;
    await isArtTokenBecause.setDefinition(tokenId, 1, 2, 3, 4);
    expect(await isArtTokenBecause.getDefinitionText(tokenId))
      .to.equal("This token is art because it critically interrogates ontological materiality");
  });

  it("Should emit set definition events", async function () {
    const isArtTokenBecause = await IsArtTokenBecause.deployed();
    const tokenId = 3;
    const result = await isArtTokenBecause.setDefinition(tokenId, 2, 4, 6, 8);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("DefinitionChanged");
    expect(result.logs[0].args.theorist).to.equal(owner);
    expect(result.logs[0].args.tokenid.toNumber()).to.equal(tokenId);
    expect(result.logs[0].args.extent.toNumber()).to.equal(2);
    expect(result.logs[0].args.relation.toNumber()).to.equal(4);
    expect(result.logs[0].args.connection.toNumber()).to.equal(6);
    expect(result.logs[0].args.subject.toNumber()).to.equal(8);
    // Make sure the state matches
    expect(await isArtTokenBecause.getDefinitionText(tokenId))
      .to.equal("This token is art because it unprecedentedly reacts to historical aesthetics");
  });

  it("Should not allow non-owner to set definition", async function () {
    const isArtTokenBecause = await IsArtTokenBecause.deployed();
    try {
      await isArtTokenBecause.setDefinition(
        4, 1, 2, 3, 4,
        { from: other }
      );
      expect.fail("Should fail! Only token holder can set definition.");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can set definition");
      }
  });

  it("Should not allow owner to set invalid definition", async function () {
    const isArtTokenBecause = await IsArtTokenBecause.deployed();
    try {
      await isArtTokenBecause.setDefinition(
        5, 1, 2, 3, 100
      );
      expect.fail("Should fail! Invalid definition property.");
    } catch (error) {
        expect(error.reason)
          .to.equal("Invalid definition property");
      }
  });

});
