/* global expect require web3 */

const testErc721 = require("../lib/testErc721.js");
const ProofOfWork = require("../lib/proofOfWork.js");

const IsArtTokenProofOfWork = artifacts.require("IsArtTokenProofOfWork");

const NUM_TOKENS = 16;

const KNOWN = [
  [1, 1, 18710863, "0x697300c169c649338bf9660d266d55870d55ce6c1fdda73f5a30a8572574dae4"],
  [1, 2, 9712539, "0x6e6f74625c3dfaabeafd4b80e7af48a1b6919ced5d786c052e3f02482c16f029"],
  [1, 3, 39034773, "0x69730065aa129cb9bf51b65003da479a91a3e51eef3407e8773881f7c2b8d0c7"],
  [1, 4, 1775521, "0x6e6f74d6c27eb1a578802c4a05ca55bb64523e9e8567e92dc2b10e3761d2dbe2"],
  [1, 5, 19693091, "0x6973006be84996d2d1ae0bb150ef9aad0d1d0e7e97d73b9d898861ea7680b545"],
  [1, 6, 12892724, "0x6e6f74974850deeabc96088febf604786655b17821cca697f57f9a76f5a4a37c"],
  [1, 7, 2115619, "0x697300ad71f907b8ffad4286677e9cbcac3587583703e529ca19d082982e231b"],
  [1, 8, 24457254, "0x6e6f745bd0517e511f221b1a6f939fada9771a366be998bfcdcea93d4e795f28"],
  [1, 9, 3025691, "0x697300ae193627ce2d6456c3a713d6876cd039fe6e9b931f334b897e899593b8"],
  [1, 10, 1224645, "0x6e6f749d579c539908421b5280b83117a110b4bd69de9b3976f8009d36fdb3376fdb337"]
];

contract("IsArtTokenProofOfWork", (accounts) => {
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
    
    // We increment it the first time we call round(), so decrement here.
    const proofOfWork = new ProofOfWork(
      KNOWN[0][0],
      KNOWN[0][1],
      web3.utils.toBN(KNOWN[0][2] - 1)
    );
    await proofOfWork.round();

    const status = await isArtTokenProofOfWork.checkIsArt(
      proofOfWork.tokenId,
      proofOfWork.sequence,
      proofOfWork.nonce,
      proofOfWork.hashHex
    );
    expect(status).to.equal(true);
  });

  it("Should allow owner to set status", async () => {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();

    await isArtTokenProofOfWork.setIsArt(
      KNOWN[1][0],
      KNOWN[1][1],
      KNOWN[1][2],
      KNOWN[1][3]
    );

    expect((await isArtTokenProofOfWork.getSequence(KNOWN[1][0])).toNumber())
      .to.equal(KNOWN[1][1]);
    expect(await isArtTokenProofOfWork.getIsArt(KNOWN[1][0]))
      .to.equal(KNOWN[1][3]);
  });

  it("Should emit status events", async function () {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();
    
    let result = await isArtTokenProofOfWork.setIsArt(
      KNOWN[2][0],
      KNOWN[2][1],
      KNOWN[2][2],
      KNOWN[2][3]
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(result.logs[0].args.tokenId.toNumber()).to.equal(KNOWN[2][0]);
    expect(result.logs[0].args.sequence.toNumber()).to.equal(KNOWN[2][1]);
    expect(result.logs[0].args.nonce.toNumber()).to.equal(KNOWN[2][2]);
    expect(result.logs[0].args.is_art).to.equal(KNOWN[2][3]);
  });
  
  it("Should not allow non-owner to set status", async () => {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();
    const tokenId = 1;

    try {
      await isArtTokenProofOfWork.setIsArt(
        KNOWN[3][0],
        KNOWN[3][1],
        KNOWN[3][2],
        KNOWN[3][3],
        { from: other }
      );
      assert.fail("Non-owner set token status");
    } catch (e) {
      expect(e.reason).to.equal("Only token holder can set state");
    }
  });

  it("Should not allow owner to set status with bad params", async () => {
    const isArtTokenProofOfWork = await IsArtTokenProofOfWork.deployed();

    try {
      await isArtTokenProofOfWork.setIsArt(
        KNOWN[3][0],
        KNOWN[4][1],
        KNOWN[3][2],
        KNOWN[3][3]
      );
      assert.fail("Owner set token status with bad sequence number");
    } catch (e) {
      expect(e.reason).to.equal("Incorrect sequence number");
    }

    try {
      await isArtTokenProofOfWork.setIsArt(
        KNOWN[3][0],
        KNOWN[3][1],
        KNOWN[3][2],
        KNOWN[4][3]
      );
      assert.fail("Owner set token status with bad params");
    } catch (e) {
      expect(e.reason).to.equal("Incorrect parameters");
    }
  });
  
});
