/* global expect require */

const secret = require("../lib/secret.js");
const testErc721 = require("../lib/testErc721.js");

const IsArtTokenSecret = artifacts.require("IsArtTokenSecret");

const NUM_TOKENS = 16;

contract("IsArtTokenSecret", (accounts) => {
  const self = accounts[0];
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
    let ciphertext = secret.encrypt(self, 1, 1, "is");
    await isArtTokenSecret.toggle(1, web3.utils.bytesToHex(ciphertext));
    expect(secret.decrypt(
      self,
      1,
      1,
      web3.utils.hexToBytes(await isArtTokenSecret.tokenIsArt(1))
    )).to.equal("is");
    ciphertext = secret.encrypt(self, 1, 2, "is not");
    await isArtTokenSecret.toggle(1, web3.utils.bytesToHex(ciphertext));
    expect(secret.decrypt(
      self,
      1,
      2,
      web3.utils.hexToBytes(await isArtTokenSecret.tokenIsArt(1))
    )).to.equal("is not");
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();

    let ciphertext = secret.encrypt(
      self,
      1,
      await web3.eth.getTransactionCount(self, 'pending'),
      "is"
    );
    let result = await isArtTokenSecret.toggle(
      1,
      web3.utils.bytesToHex(ciphertext)
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(secret.decrypt(
      self,
      1,
      (await web3.eth.getTransaction(result.receipt.transactionHash)).nonce,
      web3.utils.hexToBytes(result.logs[0].args.is_art)
    )).to.equal("is");
    ciphertext = secret.encrypt(
      self,
      1,
      await web3.eth.getTransactionCount(self, 'pending'),
      "is not"
    );
    result = await isArtTokenSecret.toggle(
      1,
      web3.utils.bytesToHex(ciphertext)
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(secret.decrypt(
      self,
      1,
      (await web3.eth.getTransaction(result.receipt.transactionHash)).nonce,
      web3.utils.hexToBytes(result.logs[0].args.is_art)
    )).to.equal("is not");
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    try {
      await isArtTokenSecret.toggle(
        1,
        web3.utils.asciiToHex("-----"),
        { from: other }
      );
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
    }
  });

});
