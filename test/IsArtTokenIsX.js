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
      "Is Art (Token Is X)",
      "ISATIX",
      NUM_TOKENS
    );

    const isArtTokenIsX = await IsArtTokenIsX.deployed();

    expect(await isArtTokenIsX.getDefinitionText(1))
      .to.equal("this token is art because it is not engaging with specificity");
    expect(await isArtTokenIsX.getDefinitionData(1))
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
    await isArtTokenIsX.setDefinition(tokenId, 1, 2, 3, 4);
    expect(await isArtTokenIsX.getDefinitionText(tokenId))
      .to.equal("this token is art because it competently critiques ontologically determined by materiality");
  });

  it("Should emit set definition events", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    const tokenId = 3;
    const result = await isArtTokenIsX.setDefinition(tokenId, 2, 4, 6, 8);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("DefinitionChanged");
    expect(result.logs[0].args.theorist).to.equal(owner);
    expect(result.logs[0].args.tokenid.toNumber()).to.equal(tokenId);
    expect(result.logs[0].args.extent.toNumber()).to.equal(2);
    expect(result.logs[0].args.connection.toNumber()).to.equal(4);
    expect(result.logs[0].args.relation.toNumber()).to.equal(6);
    expect(result.logs[0].args.subject.toNumber()).to.equal(8);
    // Make sure the state matches
    expect(await isArtTokenIsX.getDefinitionText(tokenId))
      .to.equal("this token is art because it expresses logically reacting to aesthetics");
  });

  it("Should not allow non-owner to set definition", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.setDefinition(
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
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.setDefinition(
        5, 1, 2, 3, 100
      );
      expect.fail("Should fail! Invalid definition property.");
    } catch (error) {
        expect(error.reason)
          .to.equal("Invalid definition property");
      }
  });

});
