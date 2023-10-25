/* global expect web3 */

const crypto = require('crypto');

const testErc721 = require('../lib/testErc721.js');

const NUM_TOKENS = 16;
const IsArtTokenSecret = artifacts.require("IsArtTokenSecret");

// Yes, I know. This isn't serious crypto, and we need shorter ciphertexts.
// DO NOT USE ANY PART OF THIS ELSEWHERE!!!!!
const jwks = {
  privateKey: {
    key_ops: [ 'decrypt' ],
    ext: true,
    kty: 'RSA',
    n: '1pKtU5T-oxoa1xEsPHAONO9VmP-w6shIWrdqfMaa4p8plg9rjZ2PoAxpBiq_cHBIvCeim08TPF0pTOj470JDyw',
    e: 'AQAB',
    d: 'feGvLcnLWYSHGoVInmxe6U8_uHLJJ_Q3_oB8SJd7ZldGYJBZQuvkW4A6N3nhuJl89WoIUufrFXmyUyL9dxwvAQ',
    p: '-NPhmCHO21EvZjj7LMV4Dv0-WRlNWne2yZKpVUmf_Ok',
    q: '3MIHFrqAWo7AvdKyws3xy-rBq_cV3rYhJ7ZFfpzVepM',
    dp: 'hqnE0ZyaYr9RM7Vq2hQUoagUcgvrfSaE2hpxYiLyXuE',
    dq: '13nn825tVHcceOxNIkpk5napPdI6nZ1GtX17Tb-FvFM',
    qi: 'A_unjsYjwHcKxpNAMNgHirn8ch8SrSZqwBtqml8-ZWs',
    alg: 'RSA-OAEP'
  },
  publicKey: {
    key_ops: [ 'encrypt' ],
    ext: true,
    kty: 'RSA',
    n: '1pKtU5T-oxoa1xEsPHAONO9VmP-w6shIWrdqfMaa4p8plg9rjZ2PoAxpBiq_cHBIvCeim08TPF0pTOj470JDyw',
    e: 'AQAB',
    alg: 'RSA-OAEP'
  }
};

async function importPrivateKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-1",
    },
    false,
    [ 'decrypt' ]
  );
}

async function importPublicKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-1",
    },
    false,
    [ 'encrypt' ]
  );
}

async function encryptMessage(key, plaintext) {
  return [...new Uint8Array(await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    key,
    new TextEncoder("ascii").encode(plaintext),
  ))].map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

async function decryptMessage(key, cipherhex) {
  const ciphertext = Uint8Array.from(cipherhex.replace('0x', '')
                                     .match(/.{1,2}/g)
                                     .map((byte) => parseInt(byte, 16)));
  return new TextDecoder("utf-8")
    .decode(await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      key,
      ciphertext,
    ));
}

function splitHex(hex) {
  return [
    `0x${hex.substring(0, 64)}`,
    `0x${hex.substring(64)}`
  ];
}

function joinHex(a, b) {
  return `0x${a.replace('0x', '')}${b.replace('0x', '')}`;
}

async function encrypt (plaintext) {
  return splitHex(await encryptMessage(
    await importPublicKey(jwks.publicKey),
    plaintext
  ));
}

async function decrypt(cipherhexes) {
  return decryptMessage(
    await importPrivateKey(jwks.privateKey),
    joinHex(...cipherhexes)
  );
}

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
  });

  it("Should allow owner to toggle state", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();
    let cipherhexes = await encrypt("is");
    await isArtTokenSecret.toggle(1, cipherhexes);
    expect(await decrypt(await isArtTokenSecret.tokenIsArt(1)))
      .to.equal("is");
    cipherhexes = await encrypt("is not");
    await isArtTokenSecret.toggle(1, cipherhexes);
    expect(await decrypt(await isArtTokenSecret.tokenIsArt(1)))
      .to.equal("is not");
  });

  it("Should emit toggle status events", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();

    let cipherhexes = await encrypt("is");
    let result = await isArtTokenSecret.toggle(1, cipherhexes);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(await decrypt(result.logs[0].args.is_art))
      .to.equal("is");

    cipherhexes = await encrypt("is not");
    result = await isArtTokenSecret.toggle(1, cipherhexes);
    expect(result.logs.length).to.equal(1);
    expect(result.logs[0].event).to.equal("Status");
    expect(await decrypt(result.logs[0].args.is_art))
      .to.equal("is not");
  });

  it("Should not allow non-owner to toggle state", async function () {
    const isArtTokenSecret = await IsArtTokenSecret.deployed();
    const num_tokens = await isArtTokenSecret.NUM_TOKENS();
    try {
      let cipherhexes = await encrypt("is");
      await isArtTokenSecret.toggle(1, cipherhexes, { from: other });
      expect.fail("Non-token-holder toggled state!");
    } catch (error) {
      expect(error.data.reason)
        .to.equal("Only token holder can toggle state");
    }
  });

});
