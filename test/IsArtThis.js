/* global expect require web3 */

const testErc721 = require("../lib/testErc721.js");

const NUM_TOKENS = 16;
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtThis = artifacts.require("IsArtThis");

contract("IsArtThis", (accounts) => {
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtThis,
      "Is Art (This)",
      "ISATH",
      NUM_TOKENS
    );

    const isArtThis = await IsArtThis.deployed();
    const num_tokens = await isArtThis.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      expect(web3.utils.hexToUtf8(await isArtThis.isArt(i)))
        .to.equal("is not");
    }
  });

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtThis
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtThis
  ));

  it("Should allow owner to toggle state", async function () {
    const isArtThis = await IsArtThis.deployed();
    const num_tokens = await isArtThis.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      await isArtThis.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtThis.isArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      await isArtThis.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtThis.isArt(i)))
        .to.equal("is not");
    }
  });

  it("Should emit toggle status events", async function () {
    const isArtThis = await IsArtThis.deployed();
    const num_tokens = await isArtThis.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtThis.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtThis.isArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtThis.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_NOT_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtThis.isArt(i)))
        .to.equal("is not");
    }
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtThis = await IsArtThis.deployed();
    const num_tokens = await isArtThis.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await isArtThis.toggle(i, { from: other });
        expect.fail("Non-token-holder toggled state!");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can toggle state");
      }
    }
  });

});
