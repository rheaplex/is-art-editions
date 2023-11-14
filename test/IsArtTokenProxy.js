/* global artifacts contract expect it web3 */

const testErc721 = require('../lib/testErc721.js');
const IsArtTokenProxy = artifacts.require("IsArtTokenProxy");
const IsArt = artifacts.require("IsArt");

const NUM_TOKENS = 16;
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";

contract("IsArtTokenProxy", async (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async () =>
    testErc721.setup(
      accounts,
      IsArtTokenProxy,
      "Is Art (Token, Proxy)",
      "ISATP",
      NUM_TOKENS
    ));

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenProxy
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenProxy
    ));

  it("Should allow owner to toggle state", async function () {
    const isArtTokenProxy = await IsArtTokenProxy.deployed();

    await isArtTokenProxy.toggle(1);
      expect(web3.utils.hexToUtf8(await isArtTokenProxy.tokenIsArt(1)))
        .to.equal("is");

      await isArtTokenProxy.toggle(1);
      expect(web3.utils.hexToUtf8(await isArtTokenProxy.tokenIsArt(1)))
        .to.equal("is not");
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenProxy = await IsArtTokenProxy.deployed();
    const isArt = await IsArt.deployed();

    let result = await isArtTokenProxy.toggle(2);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("ProxyStatus");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(2);
    expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);
    // Make sure the actual state matches
    expect(await isArt.is_art()).to.equal(IS_BYTES6);

    result = await isArtTokenProxy.toggle(2);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("ProxyStatus");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(2);
    expect(result.logs[0].args.is_art).to.equal(IS_NOT_BYTES6);
    // Make sure the actual state matches
    expect(await isArt.is_art()).to.equal(IS_NOT_BYTES6);
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenProxy = await IsArtTokenProxy.deployed();

    try {
      await isArtTokenProxy.toggle(3, { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
    }
  });

});
