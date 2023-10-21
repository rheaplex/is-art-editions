/* global expect web3 */

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = web3.utils.toBN(16);
const IS_BYTES6 = "0x697300000000";
const IS_NOT_BYTES6 = "0x6973206e6f74";
const IsArtTokenSecret = artifacts.require("IsArtTokenSecret");

let iv = new Uint8Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
let key = new Uint8Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
let data = new Uint8Array([0, 0, 0, 0, 105, 115]);

const mod = (n, d) => ((n % d) + d) % d;

const encrypt = (plaintext, tokenId, accountAddress) => {
  let ciphertext = [];
  let addr = accountAddress.replace('0x', '');
  for(let i = 0; i < plaintext.length; i++) {
    ciphertext.push(plaintext.charCodeAt(i)
                        + tokenId
                        + i
                        + parseInt(addr.substring(i * 2, (i * 2) + 1), 16)
                        + 1);
  }
  return String.fromCharCode(...ciphertext);
};

const decrypt = (ciphertext, tokenId, accountAddress) => {
  let plaintext = [];
  let addr = accountAddress.replace('0x', '');
  for(let i = 0; i < ciphertext.length; i++) {
    plaintext.push(ciphertext.charCodeAt(i)
                       - tokenId
                       - i
                       - parseInt(addr.substring(i * 2, (i * 2) + 1), 16)
                       - 1);
  }
  return String.fromCharCode(...plaintext);
};

contract("IsArtTokenSecret", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    await testErc721.setup(
      accounts,
      IsArtTokenSecret,
      "Is Art (Token, Secret)",
      "ISATS",
      NUM_TOKENS
    );

    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      expect(web3.utils.hexToUtf8(await isArtTokenSecret.tokenIsArt(i)))
        .to.equal("??????");
    }
  });

  it("Should allow owner to toggle state", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();
    let ciphertext = encrypt("is    ", 1, owner);
    await isArtTokenSecret.toggle(1, web3.utils.asciiToHex(ciphertext));
    expect(decrypt(web3.utils.hexToAscii(await isArtTokenSecret.tokenIsArt(1)),
                   1,
                   owner))
      .to.equal("is    ");
    ciphertext = encrypt("is not", 1, owner);
    await isArtTokenSecret.toggle(1, web3.utils.asciiToHex(ciphertext));
    expect(decrypt(web3.utils.hexToAscii(await isArtTokenSecret.tokenIsArt(1)),
                   1,
                   owner))
      .to.equal("is not");
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();

    let ciphertext = encrypt("is    ", 1, owner);
    let result = await isArtTokenSecret.toggle(
      1,
      web3.utils.asciiToHex(ciphertext)
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(decrypt(web3.utils.hexToAscii(result.logs[0].args.is_art),
                   1,
                   owner))
      .to.equal("is    ");
    ciphertext = encrypt("is not", 1, owner);
    result = await isArtTokenSecret.toggle(
      1,
      web3.utils.asciiToHex(ciphertext)
    );
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(decrypt(web3.utils.hexToAscii(result.logs[0].args.is_art),
                   1,
                   owner))
      .to.equal("is not");
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();
    try {
      await isArtTokenSecret.toggle(1, '0x000000000000', { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
    }
  });

});
