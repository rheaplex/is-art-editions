/* global expect require web3 */

const testErc721 = require("../lib/testErc721.js");

const NUM_TOKENS = 16;
const IsArtTokenMetadata = artifacts.require("IsArtTokenMetadata");

contract("IsArtTokenMetadata", (accounts) => {
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenMetadata,
      "Is Art (Token Metadata)",
      "ISATM",
      NUM_TOKENS
    );

    const isArtTokenMetadata = await IsArtTokenMetadata.deployed();
    const num_tokens = await isArtTokenMetadata.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      expect(web3.utils.hexToUtf8(await isArtTokenMetadata.tokenMetadataIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenMetadata
    ));

  it("Should allow owner to toggle state", async function () {
    const isArtTokenMetadata = await IsArtTokenMetadata.deployed();
    const num_tokens = await isArtTokenMetadata.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      await isArtTokenMetadata.toggleMetadata(i);
      expect(web3.utils.hexToUtf8(await isArtTokenMetadata.tokenMetadataIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      await isArtTokenMetadata.toggleMetadata(i);
      expect(web3.utils.hexToUtf8(await isArtTokenMetadata.tokenMetadataIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenMetadata = await IsArtTokenMetadata.deployed();
    const num_tokens = await isArtTokenMetadata.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtTokenMetadata.toggleMetadata(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("MetadataUpdate");
      expect(result.logs[0].args._tokenId.toNumber()).to.equal(i);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtTokenMetadata.tokenMetadataIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtTokenMetadata.toggleMetadata(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("MetadataUpdate");
      expect(result.logs[0].args._tokenId.toNumber()).to.equal(i);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtTokenMetadata.tokenMetadataIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenMetadata = await IsArtTokenMetadata.deployed();
    const num_tokens = await isArtTokenMetadata.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await isArtTokenMetadata.toggleMetadata(i, { from: other });
        expect.fail("Non-token-holder toggled metadata state!");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can toggle metadata state");
      }
    }
  });

});
