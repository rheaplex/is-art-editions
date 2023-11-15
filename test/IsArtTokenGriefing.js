/* global expect require web3 */

const testErc721 = require("../lib/testErc721.js");

const IsArtTokenGriefing = artifacts.require("IsArtTokenGriefing");

const NUM_TOKENS = 16;
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";

contract("IsArtTokenGriefing", (accounts) => {
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenGriefing,
      "Is Art (Token, Griefing)",
      "ISATG",
      NUM_TOKENS
    );

    const isArtTokenGriefing = await IsArtTokenGriefing.deployed();
    const num_tokens = await isArtTokenGriefing.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      expect(web3.utils.hexToUtf8(await isArtTokenGriefing.tokenIsArt(i)))
        .to.equal("is");
    }
  });

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenGriefing
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenGriefing
  ));

  it("Should allow owner to toggle state", async function () {
    const isArtTokenGriefing = await IsArtTokenGriefing.deployed();
    const num_tokens = await isArtTokenGriefing.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      await isArtTokenGriefing.toggle(i);
      if (i % 2 == 0) {
        expect(web3.utils.hexToUtf8(await isArtTokenGriefing.tokenIsArt(i)))
          .to.equal("is");
      } else {
        expect(web3.utils.hexToUtf8(await isArtTokenGriefing.tokenIsArt(i)))
          .to.equal("is not");
      }
    }
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenGriefing = await IsArtTokenGriefing.deployed();
    const num_tokens = await isArtTokenGriefing.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtTokenGriefing.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      if (i % 2 == 0) {
        expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);
        // Make sure the state matches
        expect(web3.utils.hexToUtf8(await isArtTokenGriefing.tokenIsArt(i)))
          .to.equal("is");
      } else {
        expect(result.logs[0].args.is_art).to.equal(IS_NOT_BYTES6);
        // Make sure the state matches
        expect(web3.utils.hexToUtf8(await isArtTokenGriefing.tokenIsArt(i)))
          .to.equal("is not");
      }
    }

  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenGriefing = await IsArtTokenGriefing.deployed();

    try {
      await isArtTokenGriefing.toggle(1, { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
    }
  });

});
