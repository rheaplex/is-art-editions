/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = web3.utils.toBN(16);
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtToken = artifacts.require("IsArtToken");

const TOKENIDS = require('../lib/composition.js').generateTokenIds();

contract("IsArtToken", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtToken,
      "Is Art (Token)",
      "ISAT",
      NUM_TOKENS
    );

    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should allow owner to toggle state", async function () {
    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should emit toggle status events", async function () {
    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtToken.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtToken.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_NOT_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await isArtToken.toggle(i, { from: other });
        expect.fail("Non-token-holder toggled state!");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can toggle state");
      }
    }
  });

});
