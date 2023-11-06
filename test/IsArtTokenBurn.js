/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = 16;
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtTokenBurn = artifacts.require("IsArtTokenBurn");

contract("IsArtTokenBurn", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenBurn,
      "Is Art (Token, Burn)",
      "ISATB",
      NUM_TOKENS
    );

    const isArtTokenBurn = await IsArtTokenBurn.deployed();
    const num_tokens = await isArtTokenBurn.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      expect(web3.utils.hexToUtf8(await isArtTokenBurn.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should handle transfers correctly", async function () {
    await testErc721.transfers(accounts, IsArtTokenBurn);
  });

  it("Should handle URLs correctly", async () => {
    await testErc721.urls(accounts, IsArtTokenBurn);
  });

  it("Should allow owner to burn", async function () {
    const isArtTokenBurn = await IsArtTokenBurn.deployed();
    await isArtTokenBurn.burn(1);
    expect(web3.utils.hexToUtf8(await isArtTokenBurn.tokenIsArt(1)))
      .to.equal("is");
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenBurn = await IsArtTokenBurn.deployed();
    const result = await isArtTokenBurn.burn(2);
    // Toggle event, then Transfer (to null).
      expect(result.logs.length).to.equal(2);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtTokenBurn.tokenIsArt(2)))
        .to.equal("is");
  });

  it("Should not allow non-owner to toggle burn", async function () {
    const isArtTokenBurn = await IsArtTokenBurn.deployed();
    try {
      await isArtTokenBurn.burn(3, { from: other });
      expect.fail("Non-token-holder burned it!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can burn it");
    }
  });

  it("Cannot manipulate burned token", async function () {
    const isArtTokenBurn = await IsArtTokenBurn.deployed();
    try {
      await isArtTokenBurn.transferFrom(owner, other, 1);
      expect.fail("Burned token was transferred!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("ERC721: invalid token ID");
    }
  });

   it("Burned token still has art state", async function () {
     const isArtTokenBurn = await IsArtTokenBurn.deployed();
     expect(web3.utils.hexToUtf8(await isArtTokenBurn.tokenIsArt(1)))
       .to.equal("is");
  });

});
