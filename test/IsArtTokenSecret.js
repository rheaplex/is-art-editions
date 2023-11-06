/* global expect web3 */

const secret = require('../lib/secret.js');

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = 16;
const IsArtTokenSecret = artifacts.require("IsArtTokenSecret");

contract("IsArtTokenSecret", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async () =>
    await testErc721.setup(
      accounts,
      IsArtTokenSecret,
      "Is Art (Token, Secret)",
      "ISATS",
      NUM_TOKENS
    ));

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenSecret
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenSecret
  ));

  it("Should allow owner to toggle state", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();
    let cipherhexes = await secret.encrypt("is");
    await isArtTokenSecret.toggle(1, cipherhexes);
    expect(await secret.decrypt(await isArtTokenSecret.tokenIsArt(1)))
      .to.equal("is");
    cipherhexes = await secret.encrypt("is not");
    await isArtTokenSecret.toggle(1, cipherhexes);
    expect(await secret.decrypt(await isArtTokenSecret.tokenIsArt(1)))
      .to.equal("is not");
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();

    let cipherhexes = await secret.encrypt("is");
    let result = await isArtTokenSecret.toggle(1, cipherhexes);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(await secret.decrypt(result.logs[0].args.is_art))
      .to.equal("is");

    cipherhexes = await secret.encrypt("is not");
    result = await isArtTokenSecret.toggle(1, cipherhexes);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(await secret.decrypt(result.logs[0].args.is_art))
      .to.equal("is not");
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();
    try {
      let cipherhexes = await secret.encrypt("is");
      await isArtTokenSecret.toggle(1, cipherhexes, { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
    }
  });

});
