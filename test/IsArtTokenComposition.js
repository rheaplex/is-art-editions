/* global artifacts expect web3 */

const testErc721 = require('../lib/testErc721.js');
const IsArtTokenComposition = artifacts.require("IsArtTokenComposition");
const composition = require('../lib/composition.js');

const tokenText = id => web3.utils.hexToAscii(
  `0x${id.substring(20)}`
).replace(/^\0+/, '');

contract("IsArtTokenComposition", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async () =>
    testErc721.setup(
      accounts,
      IsArtTokenComposition,
      "Is Art (Token, Composition)",
      "ISATC",
      composition.NUM_TOKENS));

  it("Should mint tokens with correct names & structure", async function () {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = (await isArtTokenComposition.NUM_TOKENS()).toNumber();

    for (let i = 0; i < num_tokens; i++) {
      const id = composition.TOKEN_IDS[i];
      // Whole token ID.
      // Strip 0x.
      expect((await isArtTokenComposition.tokenByIndex(i)).toString(16))
        .to.equal(id.substring(2));
      // Token kind.
      expect((await isArtTokenComposition.kindOf(id)).toNumber())
        .to.equal(i < composition.NUM_PARENT_TOKENS
                  ? composition.PARENT_KIND
                  : composition.CHILD_KIND);
      // Serial number.
      // Token serials start at 1.
      expect((await isArtTokenComposition.serialOf(id)).toNumber())
        .to.equal(i + 1);
      // Token text.
      // Remove 0x, kind, and serial
      expect(await isArtTokenComposition.textOf(id))
        .to.equal(tokenText(id));
      if (i < composition.NUM_PARENT_TOKENS) {
        // Parent tokens.
        // Parent/child relationships are checked for child tokens, not here.
        const kids = await isArtTokenComposition
              .childrenOf(composition.TOKEN_IDS[i]);
        // Make sure we have all the initial kids set.
        kids.map(a => a.toString(16) != '0');

      } else {
        // Child tokens.
        // Strip 0x.
        // Check parent.
        expect((await isArtTokenComposition.parentOf(id)).toString(16))
          .to.equal(composition.PARENT_IDS[i].substring(2));
        // Check that this is the correct child of parent.
        const kids = await isArtTokenComposition
              .childrenOf(composition.PARENT_IDS[i]);
        expect(kids[composition.CHILD_INDEXES[i]].toString(16))
          .to.equal(id.substring(2));
      }
    }
  });

  it("Should render correct token text", async function () {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const num_tokens = (await isArtTokenComposition.NUM_TOKENS()).toNumber();

    for (let i = 0; i < num_tokens; i++) {
      const id = composition.TOKEN_IDS[i];
      if (i < composition.NUM_PARENT_TOKENS) {
        // Parent tokens.
        const kids = await isArtTokenComposition
                      .childrenOf(composition.TOKEN_IDS[i]);
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

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenComposition
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenComposition
  ));

  it("Should allow owner to remove and attach sub-tokens", async () => {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const parent = await isArtTokenComposition.tokenByIndex(4);
    const children = await isArtTokenComposition.childrenOf(parent);

    for (let i = 0; i < composition.NUM_CHILD_SLOTS; i++) {
      try {
        await isArtTokenComposition.detachChild(parent, i);
        expect((await isArtTokenComposition.parentOf(children[i])).toNumber())
          .to.equal(0);
        expect((await isArtTokenComposition.childrenOf(parent))[i].toNumber())
          .to.equal(0);
      } catch (e) {
        assert.fail(`Couldn't remove child token ${i}: ${e}.`);
      }
    }

    const parentBN = web3.utils.toBN(parent);
    for (let i = 0; i < composition.NUM_CHILD_SLOTS; i++) {
      const j = composition.NUM_CHILD_SLOTS - (i + 1);
      try {
        await isArtTokenComposition.attachChild(parent, children[j], i);
        expect((await isArtTokenComposition.parentOf(children[j]))
               .eq(parentBN))
          .to.equal(true);
        expect((await isArtTokenComposition.childrenOf(parent))[i]
               .eq(web3.utils.toBN(children[j])))
          .to.equal(true);
      } catch (e) {
        assert.fail(`Couldn't attach child token ${i}: ${e}.`);
      }
    }
  });

  it("Should not allow non-owner to remove or attach sub-tokens", async () => {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const parent = await isArtTokenComposition.tokenByIndex(5);
    const children = await isArtTokenComposition.childrenOf(parent);

    try {
      await isArtTokenComposition.detachChild(parent, 0, { from: other });
      assert.fail(`Non-owner (both) removed child token.`);
    } catch (e) {}

    await isArtTokenComposition.detachChild(parent, 1);

    try {
      await isArtTokenComposition.attachChild(
        parent,
        children[1],
        { from: other }
      );
      assert.fail('Non-owner (both) attached child token.');
    } catch (e) {}

    await isArtTokenComposition.transferFrom(owner, other, children[1]);

    try {
      await isArtTokenComposition.attachChild(
        parent,
        children[1],
        1,
        { from: other }
      );
      assert.fail('Non-owner (parent) attached child token.');
    } catch (e) {}

    try {
      await isArtTokenComposition.attachChild(
        parent,
        children[1],
        1
      );
      assert.fail('Non-owner (child) attached child token.');
    } catch (e) {}
  });

  it("Should not allow owner to overwrite sub-tokens", async () => {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const parent = await isArtTokenComposition.tokenByIndex(6);
    const children = await isArtTokenComposition.childrenOf(parent);

    await isArtTokenComposition.detachChild(parent, 0);

    try {
      await isArtTokenComposition.attachChild(
        parent,
        children[0],
        1
      );
      assert.fail('Overwrote child token.');
    } catch (e) {}

    await isArtTokenComposition.transferFrom(owner, other, children[1]);
  });

  it("Should transfer sub-tokens with parent token", async () => {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const parent = await isArtTokenComposition.tokenByIndex(7);

    await isArtTokenComposition.transferFrom(owner, other, parent);
    const children = await isArtTokenComposition.childrenOf(parent);

    for (let i = 0; i < composition.NUM_CHILD_SLOTS; i++) {
      const child = children[i];
      // Check parent.
      expect((await isArtTokenComposition.parentOf(child)).eq(parent))
        .to.equal(true);
      // Check owner.
      expect(await isArtTokenComposition.ownerOf(child))
        .to.equal(other);
    }
  });

  it("Should not transfer sub-tokens if transfer fails", async () => {
    const isArtTokenComposition = await IsArtTokenComposition.deployed();
    const parent = await isArtTokenComposition.tokenByIndex(8);

    try {
      await isArtTokenComposition.transferFrom(other, owner, parent);
    } catch (e) {};
    const children = await isArtTokenComposition.childrenOf(parent);

    for (let i = 0; i < composition.NUM_CHILD_SLOTS; i++) {
      const child = children[i];
      // Check parent.
      expect((await isArtTokenComposition.parentOf(child)).eq(parent))
        .to.equal(true);
      // Check owner.
      expect(await isArtTokenComposition.ownerOf(child))
        .to.equal(owner);
    }
  });

});
