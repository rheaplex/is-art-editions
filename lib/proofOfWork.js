const IS = "is\0".split("");
const IS_NOT = "is not".split("");

const web3 = require("web3");

class ProofOfWork {

  // The nonce and sequence are a BN.js .

  constructor (tokenId, sequence, initialNonce) {
    this.tokenId = tokenId;
    this.sequence = sequence;
    this.nonce = initialNonce;
    this.hashHex = "   ";
    this.target = this.sequence % 2 == 0 ? IS : IS_NOT;
  }

  async round () {
    this.nonce.iaddn(1);
    // Pack the id and nonce into a byte array as if they were uint256s
    // being packed by Solidity's abi.encodePacked() .
    this.hashHex = web3.utils.soliditySha3(
      this.tokenId,
      this.sequence,
      this.nonce
    );

    this.hashString = web3.utils.hexToAscii(this.hashHex);
  }

  found () {
    let result = true;
    for (let i = 0; i < this.target.length; i++) {
      if (this.hashString[i] != this.target[i]) {
        result = false;
        break;
      }
    }
    return result;
  }

};


// To generate test values
/*(async () => {
  const sequence = web3.utils.toBN(1);
  let pow = new ProofOfWork(1, sequence, web3.utils.toBN(-1));
  while (true) {
    await pow.round();
    if (pow.found()) {
      console.log([pow.nonce.toString(10), sequence.toString(10), pow.hashString, pow.hashHex]);
      sequence.iaddn(1);
      pow = new ProofOfWork(1, sequence, web3.utils.toBN(-1));
    }
  }
  })();*/


module.exports = ProofOfWork;
