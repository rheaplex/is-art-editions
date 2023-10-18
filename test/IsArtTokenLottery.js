/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = web3.utils.toBN(16);
const THRESHOLD = 8;
const PERCENTAGE = 6.25;
const IsArtTokenLottery = artifacts.require("IsArtTokenLottery");

const toStr = (hex) => web3.utils.hexToAscii(hex).split("\0")[0];

const shouldBe = async (blockNumber) => {
  const block = await web3.eth.getBlock(blockNumber);
  // mixHash???
  const rnd = parseInt(
    web3.utils.keccak256(web3.utils.encodePacked(
      {value: block.timestamp, type: 'uint'},
      {value: block.mixHash, type: 'uint'}
    )).slice(-1),
    16) % 2;
    if (rnd == 1) {
        return "is not";
    } else {
        return "is";
    }
};

contract("IsArtTokenLottery", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenLottery,
      "Is Art (Token, Lottery)",
      "ISATL",
      NUM_TOKENS
    );

    const isArtTokenLottery = await IsArtTokenLottery.deployed();

    expect(toStr(await isArtTokenLottery.tokenIsArt(1)))
      .to.equal("is not");
  });

  it("Should handle transfers correctly", async function () {
    await testErc721.transfers(accounts, IsArtTokenLottery);
  });

  it("Should handle URLs correctly", async () => {
    await testErc721.urls(accounts, IsArtTokenLottery);
  });

  it("Should allow owner to toggle state", async function () {
    const isArtTokenLottery = await IsArtTokenLottery.deployed();
    const tokenId = 2;
    await isArtTokenLottery.toggle(tokenId);
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenLottery = await IsArtTokenLottery.deployed();
    const tokenId = 3;
    let previous = toStr(
      await isArtTokenLottery.tokenIsArt(tokenId)
    );
    let result = await isArtTokenLottery.toggle(tokenId);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(tokenId);
    expect(toStr(result.logs[0].args.is_art))
      .to.equal(await shouldBe(result.receipt.blockNumber));
    expect(toStr(result.logs[0].args.was_art))
      .to.equal(previous);
    expect(result.logs[0].args.by).to.equal(accounts[0]);
    previous = toStr(result.logs[0].args.is_art);
    result = await isArtTokenLottery.toggle(tokenId);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(tokenId);
    expect(toStr(result.logs[0].args.is_art))
      .to.equal(await shouldBe(result.receipt.blockNumber));
    expect(toStr(result.logs[0].args.was_art))
      .to.equal(previous);
    expect(result.logs[0].args.by).to.equal(accounts[0]);
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenLottery = await IsArtTokenLottery.deployed();

    try {
      await isArtTokenLottery.toggle(5, { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
      }
  });

});
