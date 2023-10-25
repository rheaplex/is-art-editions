/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = 16;
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtTokenBlockHeight = artifacts.require("IsArtTokenBlockHeight");

contract("IsArtTokenBlockHeight", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenBlockHeight,
      "Is Art (Token, Block Height)",
      "ISATBH",
      NUM_TOKENS
    );
  });

  it("Should properly calculate state", async function () {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let id = 1; id <= num_tokens; id++) {
      for (let blockHeight = 0; blockHeight < (id * 4); blockHeight++) {
        const expected = ((Math.floor(blockHeight / id) % 2) == 1)
              ? IS_BYTES6
              : IS_NOT_BYTES6;
        expect(await isArtToken.tokenIsArtAtBlockHeight(id, blockHeight))
          .to.equal(expected);
      }
    }
  });

  it("Should allow owner to transfer", async function () {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken.transferFrom(owner, other, i);
      expect(await isArtToken.ownerOf(i))
        .to.equal(other);
    }

    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken
        .transferFrom(other, owner, i, { from: other });
      expect(await isArtToken.ownerOf(i))
        .to.equal(owner);
    }
  });

  it("Should not allow non-owner to transfer", async function () {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await isArtToken.transferFrom(
          owner,
          other,
          i,
          { from: other }
        );
        expect.fail("Should fail! Caller is not token owner nor approved.");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("ERC721: caller is not token owner or approved");
      }
    }
  });

  it("only owner can transfer ERC721 tokens", async () => {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    try {
      await isArtToken.transferFrom(accounts[1],
                                accounts[2],
                                2,
                                {from: accounts[2]});
      assert(false, "token should throw if non-owner tries to transfer token");
    } catch (error) {
      // empty
    }
  });

  it("token URLs can be updated", async () => {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    await isArtToken.setBaseUri("aaa://newurl/");
    assert.equal(await isArtToken.tokenURI(3), "aaa://newurl/3");
  });

  it("only owner can set token URLs", async () => {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    try {
      await isArtToken.setBaseUri("aaa://newerurl/", { from: accounts[2] });
      assert(false, "token should throw if non-owner tries to set base URL");
    } catch (error) {
      //empty
    }
  });

});
