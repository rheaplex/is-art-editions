/* global artifacts contract expect it web3 */

const NUM_TOKENS = web3.utils.toBN(16);
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtTokenBlockHeight = artifacts.require("IsArtTokenBlockHeight");

contract("IsArtTokenBlockHeight", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    expect(num_tokens.eq(NUM_TOKENS)).to.be.true;
    expect(await isArtToken.name()).to.equal("Is Art (Token, Block Height)");
    expect(await isArtToken.symbol()).to.equal("ISATBH");
    
    expect(num_tokens.eq(await isArtToken.balanceOf(owner))).to.be.true;
  });

  it("Should properly calculate state", async function () {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();
    
    for (let id = 1; id <= num_tokens; id++) {
      for (let blockHeight = 0; blockHeight < (id * 4); blockHeight++) {
        const expected = ((Math.floor(blockHeight / id) % 2) == 1)
              ? IS_BYTES6
              : IS_NOT_BYTES6;
        expect(await isArtToken.tokenIsArtAtBlockHeight(id, blockHeight))
          .to.equal(expected);
      }
    }
  });

  it("Should allow owner to transfer", async function () {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();
    
    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken.transferFrom(owner, other, i);
      expect(await isArtToken.ownerOf(i))
        .to.equal(other);
    }

    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken
        .transferFrom(other, owner, i, { from: other });
      expect(await isArtToken.ownerOf(i))
        .to.equal(owner);
    }
  });

  it("Should not allow non-owner to transfer", async function () {
    const isArtToken = await IsArtTokenBlockHeight.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await isArtToken.transferFrom(
          owner,
          other,
          i,
          { from: other }
        );
        expect.fail("Should fail! Caller is not token owner nor approved.");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("ERC721: caller is not token owner or approved");
      }
    }
  });

});
