/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');
const ProofOfWork = require('../lib/proofOfWork.js');

const IsArtTokenProofOfWork = artifacts.require("IsArtTokenProofOfWork");

const NUM_TOKENS = 16;

const KNOWN_NONCE = 24485091;
const KNOWN_HASH = '0x6973009d08c1b64003ab14f3beb09d693e60881165ce6a5bf60db68604c66e1e';

contract("IsArtTokenProofOfWork", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenProofOfWork,
      "Is Art (Token, Proof of Work)",
      "ISATPOW",
      NUM_TOKENS
    );
  });

  it("Should handle ERC721 transfers correctly", async () =>
    testErc721.transfers(
      accounts,
      IsArtTokenProofOfWork
    ));

  it("Should handle ERC721 urls correctly", async () =>
    testErc721.urls(
      accounts,
      IsArtTokenProofOfWork
    ));

  it("Should calculate status correctly", async () => {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();
    const tokenId = 1;
    const nonce = KNOWN_NONCE;
    
    // We increment it the first time we call round(), so decrement here.
    const proofOfWork = new ProofOfWork(tokenId, web3.utils.toBN(nonce - 1));
    await proofOfWork.round();


    const status = await isArtTokenProofOfWork.checkIsArt(
      1,
      proofOfWork.nonce,
      web3.utils.bytesToHex([...new Uint8Array(proofOfWork.hash)])
    );
    expect(status).to.equal(true);
  });

  it("Should allow owner to set status", async () => {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();
    const tokenId = 1;

    await isArtTokenProofOfWork.setIsArt(
      tokenId,
      KNOWN_NONCE,
      KNOWN_HASH
    );

    expect((await isArtTokenProofOfWork.getNonce(tokenId)).toNumber())
      .to.equal(KNOWN_NONCE);
    expect(await isArtTokenProofOfWork.getIsArt(tokenId)).to.equal(KNOWN_HASH);
  });

  it("Should emit status events", async function () {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();
    const tokenId = 1;

    //FIXME: find another nonce/hash pair to use
    let result = await isArtTokenProofOfWork.setIsArt(
      tokenId,
      KNOWN_NONCE,
      KNOWN_HASH
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(tokenId);
    expect(result.logs[0].args.is_art).to.equal(KNOWN_HASH);
    expect(result.logs[0].args.nonce.toNumber()).to.equal(KNOWN_NONCE);
  });

  it("Should not allow non-owner to set status", async () => {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();
    const tokenId = 1;

    try {
      await isArtTokenProofOfWork.setIsArt(
        tokenId,
        KNOWN_NONCE,
        KNOWN_HASH,
        { from: other }
      );
      assert.fail("Non-owner set token status");
    } catch (e) {
      expect(e.reason).to.equal("Only token holder can set state");
    }
  });

});
