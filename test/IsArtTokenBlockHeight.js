/* global expect require */

const testErc721 = require("../lib/testErc721.js");

const NUM_TOKENS = 16;
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtTokenBlockHeight = artifacts.require("IsArtTokenBlockHeight");

contract("IsArtTokenBlockHeight", (accounts) => {

  it("Should initialize contract state correctly", async () =>
    testErc721.setup(
      accounts,
      IsArtTokenBlockHeight,
      "Is Art (Token, Block Height)",
      "ISATBH",
      NUM_TOKENS
    ));

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenBlockHeight
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenBlockHeight
  ));

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

});
