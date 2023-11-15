/* global before expect require */

const testErc721 = require("../lib/testErc721.js");

const DemocraticPalette = artifacts.require("DemocraticPalette");
const IsArtTokenDemocraticPalette = artifacts.require(
  "IsArtTokenDemocraticPalette"
);

const NUM_TOKENS = 16;
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const COLOURS = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
];

const cssColour = colour => `${colour.red.toString(16).padStart(2, "0").toUpperCase()}${colour.green.toString(16).padStart(2, "0").toUpperCase()}${colour.blue.toString(16).padStart(2, "0").toUpperCase()}`;

const renderStatus = async (democraticPalette, tokenId, is) => {
  return `<div style="color: #${cssColour(await democraticPalette.palette(0))};"><span style="color: #${cssColour(await democraticPalette.palette(1))};">this contract</span> <span style="color: #${cssColour(await democraticPalette.palette(2))};">${is}</span> <span style="color: #${cssColour(await democraticPalette.palette(3))};"/>art</span>`;
};

contract("IsArtTokenDemocraticPalette", (accounts) => {
  const other = accounts[1];

  before(async function () {
    const democraticPalette = await DemocraticPalette.deployed();
    // Populate the colours
    for (let i = 0; i < COLOURS.length; i++) {
      const colour = COLOURS[i];
      await democraticPalette.voteFor(...colour);
    }
  });

  it("Should initialize contract state correctly", async () =>
    testErc721.setup(
      accounts,
      IsArtTokenDemocraticPalette,
      "Is Art (Token, Democratic Palette)",
      "ISATDP",
      NUM_TOKENS
    ));

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenDemocraticPalette
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenDemocraticPalette
    ));

  it("Should render status correctly", async () => {
    const isArtTokenDemocraticPalette
          = await IsArtTokenDemocraticPalette.deployed();
    const democraticPalette = await DemocraticPalette.deployed();
    
    const rendered = await renderStatus(democraticPalette, 1, "is not");
    const status = await isArtTokenDemocraticPalette.tokenIsArt.call(1);
    
    expect(status).to.equal(rendered);
  });

  it("Should allow token holder to toggle", async () => {
    const isArtTokenDemocraticPalette
          = await IsArtTokenDemocraticPalette.deployed();
    const democraticPalette = await DemocraticPalette.deployed();

    await isArtTokenDemocraticPalette.toggle(2);
    let rendered = await renderStatus(democraticPalette, 2, "is");
    let status = await isArtTokenDemocraticPalette.tokenIsArt.call(2);
    expect(status).to.equal(rendered);

    await isArtTokenDemocraticPalette.toggle(2);
    rendered = await renderStatus(democraticPalette, 2, "is not");
    status = await isArtTokenDemocraticPalette.tokenIsArt.call(2);
    expect(status).to.equal(rendered);
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenDemocraticPalette
          = await IsArtTokenDemocraticPalette.deployed();

    let result = await isArtTokenDemocraticPalette.toggle(3);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(3);
    expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);

    result = await isArtTokenDemocraticPalette.toggle(3);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(3);
    expect(result.logs[0].args.is_art).to.equal(IS_NOT_BYTES6);
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenDemocraticPalette = await IsArtTokenDemocraticPalette.deployed();

    try {
      await isArtTokenDemocraticPalette.toggle(3, { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
    }
  });

});
