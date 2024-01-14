const IsArtTokenSecret = artifacts.require("IsArtTokenSecret");

const secret = require('../lib/secret');

const NUM_TOKENS = 16;

module.exports = async function(_deployer, network, accounts) {
  await _deployer.deploy(IsArtTokenSecret);

  // Populate the token states so they display properly,
  // based on our event-reliant decoding scheme.
  const isArtTokenSecret = await IsArtTokenSecret.deployed();
  for(let i = 0; i < NUM_TOKENS; i++) {
    let ciphertext = secret.encrypt(
      accounts[0],
      i + 1,
      await web3.eth.getTransactionCount(accounts[0], 'pending'),
      "is"
    );
    let result = await isArtTokenSecret.toggle(
      i + 1,
      web3.utils.bytesToHex(ciphertext)
    );
  }
};
