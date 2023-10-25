/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');
const IsArtTokenComposition = artifacts.require("IsArtTokenComposition");

const NUM_PARENT_TOKENS = 16;
const NUM_CHILD_SLOTS = 5;
const NUM_CHILD_TOKENS = NUM_PARENT_TOKENS * NUM_CHILD_SLOTS;
const NUM_TOKENS = NUM_PARENT_TOKENS + NUM_CHILD_TOKENS;

const PARENT_KIND = (112).toString(16);
const CHILD_KIND = (107).toString(16);

const TOKENIDS = require('../data/composition-token-ids.json');

contract("IsArtTokenComposition", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenComposition,
      "Is Art (Token, Composition)",
      "ISATC",
      NUM_TOKENS
    );

    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = (await isArtTokenComposition.NUM_TOKENS()).toNumber();

    for (let i = 0; i < num_tokens; i++) {
      expect((await isArtTokenComposition.tokenByIndex(i)).toString(16))
        .to.equal(TOKENIDS[i].substring(2));
      expect((await isArtTokenComposition.serialOf(TOKENIDS[i])).toNumber())
        .to.equal(i + 1);
      // TODO: check type.
    }
  });

  return;

  it("Should allow owner to toggle state", async function () {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = await isArtTokenComposition.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      await isArtTokenComposition.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtTokenComposition.tokenIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      await isArtTokenComposition.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtTokenComposition.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = await isArtTokenComposition.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtTokenComposition.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtTokenComposition.tokenIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtTokenComposition.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_NOT_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtTokenComposition.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = await isArtTokenComposition.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await isArtTokenComposition.toggle(i, { from: other });
        expect.fail("Non-token-holder toggled state!");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can toggle state");
      }
    }
  });

});
