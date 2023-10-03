/* global expect web3 */

const NUM_TOKENS = web3.utils.toBN(16);
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtTokenIsX = artifacts.require("IsArtTokenIsX");

contract("IsArtTokenIsX", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    const num_tokens = await isArtTokenIsX.NUM_TOKENS();
    
    expect(num_tokens.eq(NUM_TOKENS)).to.equal(true);
    expect(await isArtTokenIsX.name()).to.equal("Is Art (Token Is X)");
    expect(await isArtTokenIsX.symbol()).to.equal("ISATIX");

    expect(num_tokens.eq(await isArtTokenIsX.balanceOf(owner))).to.equal(true);

    expect(await isArtTokenIsX.getDefinitionText(1))
      .to.equal("this token is art because it is not engaging with specificity");
    expect(await isArtTokenIsX.getDefinitionData(1))
      .to.deep.equal([
        '0x0000000000000000000000000000000000000000',
        '0',
        '0',
        '0',
        '0'
      ]);
  });

  it("Should allow owner to set definition", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    await isArtTokenIsX.setDefinition(1, 1, 2, 3, 4);
    expect(await isArtTokenIsX.getDefinitionText(1))
      .to.equal("this token is art because it competently critiques ontologically determined by materiality");
  });

  it("Should emit set definition events", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();

    const result = await isArtTokenIsX.setDefinition(3, 2, 4, 6, 8);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("DefinitionChanged");
    expect(result.logs[0].args.theorist).to.equal(owner);
    expect(result.logs[0].args.tokenid.toNumber()).to.equal(3);
    expect(result.logs[0].args.extent.toNumber()).to.equal(2);
    expect(result.logs[0].args.connection.toNumber()).to.equal(4);
    expect(result.logs[0].args.relation.toNumber()).to.equal(6);
    expect(result.logs[0].args.subject.toNumber()).to.equal(8);
    // Make sure the state matches
    expect(await isArtTokenIsX.getDefinitionText(1))
      .to.equal("this token is art because it competently critiques ontologically determined by materiality");
  });

  it("Should not allow non-owner to set definition", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.setDefinition(
        2, 1, 2, 3, 4,
        { from: other }
      );
      expect.fail("Should fail! Only token holder can toggle state.");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("Only token holder can toggle state");
      }
  });

  it("Should not allow owner to set invalid definition", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.setDefinition(
        1, 1, 2, 3, 100
      );
      expect.fail("Should fail! Invalid definition property.");
    } catch (error) {
        expect(error.reason)
          .to.equal("Invalid definition property");
      }
  });

  it("Should allow owner to transfer", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
      await isArtTokenIsX.transferFrom(owner, other, 1);
      expect(await isArtTokenIsX.ownerOf(1))
        .to.equal(other);
  });

  it("Should not allow user to transfer token they don't own", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.transferFrom(
        other,
        owner,
        2,
        { from: other }
      );
      expect.fail("Should fail! Caller is not token owner nor approved.");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("ERC721: caller is not token owner or approved");
      }
  });

  it("Should not allow unauthorized transfer", async function () {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.transferFrom(
        owner,
        other,
        1,
        { from: other }
      );
      expect.fail("Should fail! ERC721: transfer from incorrect owner.");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("ERC721: transfer from incorrect owner");
      }
  });

  it("token URLs can be updated", async () => {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    await isArtTokenIsX.setBaseUri("aaa://newurl/");
    assert.equal(await isArtTokenIsX.tokenURI(3), "aaa://newurl/3");
  });

  it("only owner can set token URLs", async () => {
    const isArtTokenIsX = await IsArtTokenIsX.deployed();
    try {
      await isArtTokenIsX.setBaseUri("aaa://newerurl/", { from: accounts[2] });
      assert(false, "token should throw if non-owner tries to set base URL");
    } catch (error) {
      // empty
    }
  });

});
