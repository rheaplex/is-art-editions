/* global expect web3 */

const NUM_TOKENS = web3.utils.toBN(16);
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtToken = artifacts.require("IsArtToken");

contract("IsArtToken", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    expect(num_tokens.eq(NUM_TOKENS)).to.be.true;
    expect(await isArtToken.name()).to.equal("Is Art (Token)");
    expect(await isArtToken.symbol()).to.equal("ISAT");
    
    expect(num_tokens.eq(await isArtToken.balanceOf(owner))).to.be.true;
    
    for (let i = 1; i <= num_tokens; i++) {
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should allow owner to toggle state", async function () {
    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();
    
    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      await isArtToken.toggle(i);
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should emit toggle status events", async function () {
    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();
    
    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtToken.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is");
    }

    for (let i = 1; i <= num_tokens; i++) {
      const result = await isArtToken.toggle(i);
      expect(result.logs.length).to.equal(1);
      expect(result.logs.length).to.equal(1);
      expect(result.logs[0].event).to.equal("Status");
      expect(result.logs[0].args.is_art).to.equal(IS_NOT_BYTES6);
      // Make sure the state matches
      expect(web3.utils.hexToUtf8(await isArtToken.tokenIsArt(i)))
        .to.equal("is not");
    }
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtToken = await IsArtToken.deployed();
    const num_tokens = await isArtToken.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await isArtToken.toggle(i, { from: other });
        expect.fail("Non-token-holder toggled state!");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can toggle state");
      }
    }
  });

  it("Should allow owner to transfer", async function () {
    const isArtToken = await IsArtToken.deployed();
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
    const isArtToken = await IsArtToken.deployed();
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
