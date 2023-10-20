/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = web3.utils.toBN(16);
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const IsArtTokenNominational = artifacts.require("IsArtTokenNominational");

const DummyERC721 = artifacts.require("DummyERC721");

contract("IsArtTokenNominational", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  let erc721;

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenNominational,
      "Is Art (Token, Nominational)",
      "ISATN",
      NUM_TOKENS
    );

    erc721 = await DummyERC721.new();
  });

  it("Should allow nft owner to nominate token they own", async function () {
    const isArtTokenNominational = await IsArtTokenNominational.deployed();
    await erc721.safeMint(owner);

    await isArtTokenNominational.nominate(
      1,
      erc721.address,
      0);

    const nomination = await isArtTokenNominational.nominationForTokenId(1);
    expect(nomination.tokenContract).to.equal(erc721.address);
    expect(parseInt(nomination.tokenId, 10)).to.equal(0);
  });

  it("Should allow nft owner to deNominate token they own", async function () {
    const isArtTokenNominational = await IsArtTokenNominational.deployed();

    await isArtTokenNominational.deNominate(
      1,
      erc721.address,
      0
    );

    const nomination = await isArtTokenNominational.nominationForTokenId(1);
    expect(nomination.tokenContract).to.equal(NULL_ADDRESS);
    expect(parseInt(nomination.tokenId, 10)).to.equal(0);
  });

  it("Should not allow non-owner to nominate", async function () {
    const isArtTokenNominational = await IsArtTokenNominational.deployed();
    try {
      await isArtTokenNominational.nominate(
        8,
        erc721.address,
        0,
        { from: other }
      );
      expect.fail("Non-token-holder nominated external token they don't own!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("You don't own that tokenId");
    }
    await erc721.safeMint(other);
    try {
      await isArtTokenNominational.nominate(
        8,
        erc721.address,
        1,
        { from: other }
      );
      expect.fail("Non-token-holder nominated external token they own!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("You don't own that tokenId");
    }
  });

  it("Should not allow nft owner to nominate token they don't own, or non-existent", async function () {
    const isArtTokenNominational = await IsArtTokenNominational.deployed();
    try {
      await isArtTokenNominational.nominate(
        1,
        accounts[5],
        0
      );
      expect.fail("Token holder nominated external token in non-existant contract!");
    } catch (error) {
      expect(error.data.message)
        .to.equal("revert");
    }
    try {
      await isArtTokenNominational.nominate(
        1,
        erc721.address,
        1
      );
      expect.fail("Token holder nominated external token they don't own!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("You don't own that external token");
    }
    try {
      await isArtTokenNominational.nominate(
        1,
        erc721.address,
        1000
      );
      expect.fail("Non-token-holder nominated external token that doesn't exist!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("ERC721: invalid token ID");
    }
  });

  it("Should emit status events", async function () {
    const isArtTokenNominational = await IsArtTokenNominational.deployed();

    await erc721.safeMint(owner);

    let result = await isArtTokenNominational.nominate(
      3,
      erc721.address,
      2
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Nominated");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(3);
    expect(result.logs[0].args.nominatedTokenContract).to.equal(erc721.address);
    expect(result.logs[0].args.nominatedTokenId.toNumber()).to.equal(2);
    expect(result.logs[0].args.by).to.equal(owner);

    result = await isArtTokenNominational.deNominate(
      3,
      erc721.address,
      2
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("DeNominated");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(3);
    expect(result.logs[0].args.nominatedTokenContract).to.equal(erc721.address);
    expect(result.logs[0].args.nominatedTokenId.toNumber()).to.equal(2);
    expect(result.logs[0].args.by).to.equal(owner);
  });

});
