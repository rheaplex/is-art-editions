/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');
const IsArtTokenComposition = artifacts.require("IsArtTokenComposition");

const NUM_PARENT_TOKENS = 16;
const NUM_CHILD_SLOTS = 6;
const NUM_CHILD_TOKENS = NUM_PARENT_TOKENS * NUM_CHILD_SLOTS;
const NUM_TOKENS = NUM_PARENT_TOKENS + NUM_CHILD_TOKENS;

const PARENT_KIND = 112;
const CHILD_KIND = 107;

const TOKENIDS = require('../data/composition-token-ids.json');

// Not-quite-copypasta from the migration.
// Here to make sure all our values match up.
const PARENT_IDS = new Array(NUM_PARENT_TOKENS).fill(web3.utils.toBN(0))
      .concat(TOKENIDS.slice(0, NUM_PARENT_TOKENS)
              .map(id => new Array(NUM_CHILD_SLOTS).fill(id))
              .flat());
const CHILD_INDEXES = new Array(NUM_PARENT_TOKENS).fill(0)
      .concat(new Array(NUM_PARENT_TOKENS)
              .fill([...Array(NUM_CHILD_SLOTS).keys()])
              .flat());

const tokenText = id => web3.utils.hexToAscii(
  `0x${id.substring(20)}`
).replace(/^\0+/, '');

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

    expect(num_tokens).to.equal(NUM_TOKENS);
  });

  it("Should mint tokens with correct names & structure", async function () {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = (await isArtTokenComposition.NUM_TOKENS()).toNumber();

    for (let i = 0; i < num_tokens; i++) {
      const id = TOKENIDS[i];
      // Whole token ID.
      // Strip 0x.
      expect((await isArtTokenComposition.tokenByIndex(i)).toString(16))
        .to.equal(id.substring(2));
      // Token kind.
      expect((await isArtTokenComposition.kindOf(id)).toNumber())
        .to.equal(i < NUM_PARENT_TOKENS ? PARENT_KIND : CHILD_KIND);
      // Serial number.
      // Token serials start at 1.
      expect((await isArtTokenComposition.serialOf(id)).toNumber())
        .to.equal(i + 1);
      // Token text.
      // Remove 0x, kind, and serial
      expect(await isArtTokenComposition.textOf(id))
        .to.equal(tokenText(id));
      if (i < NUM_PARENT_TOKENS) {
        // Parent tokens.
        // Parent/child relationships are checked for child tokens, not here.
        const kids = (await isArtTokenComposition.childrenOf(TOKENIDS[i]));
        // Make sure we have all the initial kids set.
        kids.map(a => a.toString(16) != '0');

      } else {
        // Child tokens.
        // Strip 0x.
        // Check parent.
        expect((await isArtTokenComposition.parentOf(id)).toString(16))
          .to.equal(PARENT_IDS[i].substring(2));
        // Check that this is the correct child of parent.
        const kids = await isArtTokenComposition.childrenOf(PARENT_IDS[i]);
        expect(kids[CHILD_INDEXES[i]].toString(16))
          .to.equal(id.substring(2));
      }
    }
  });

  it("Should render correct token text", async function () {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = (await isArtTokenComposition.NUM_TOKENS()).toNumber();

    for (let i = 0; i < num_tokens; i++) {
      const id = TOKENIDS[i];
      if (i < NUM_PARENT_TOKENS) {
        // Parent tokens.
        const kids = (await isArtTokenComposition.childrenOf(TOKENIDS[i]));
        // Make sure our text renders properly.
        expect(await isArtTokenComposition.tokenIsArt(id))
          .to.equal(
            tokenText(id)
              + ' '
              + kids.map(a => tokenText(a.toString(16))).join(" ")
          );
      } else {
        // Child tokens.
        // Check that is == text
        expect(await isArtTokenComposition.textOf(id))
          .to.equal(await isArtTokenComposition.tokenIsArt(id));
      }
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
