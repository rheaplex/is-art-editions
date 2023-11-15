const TARGET = "is\0".split("");

module.exports =
  class ProofOfWork {

  // The nonce is a BN.js .

  constructor (tokenId, initialNonce) {
    this.tokenId = tokenId;
    this.nonce = initialNonce;
    this.hash = "   ";
    this.decoder = new TextDecoder();
  }

  async round () {
    this.nonce.iaddn(1);
    // Pack the id and nonce into a byte array as if they were uint256s
    // being packed by Solidity's abi.encodePacked() .
    const data = new Uint8Array(this.nonce.toArray("be", 64));
    // This won't be bigger than 16, and so will be at the end of its uint256.
    data[31] = this.tokenId;
    this.hash = await crypto.subtle.digest("SHA-256", data);
    this.hashString = this.decoder.decode(this.hash);
  }

  found () {
    let result = true;
    for (let i = 0; i < TARGET.length; i++) {
      if (this.hashString[i] != TARGET[i]) {
        result = false;
        break;
      }
    }
    return result;
  }

};


/*
// To generate test values
(async () => {
  const bn = require('BN.js');
  const pow = new module.exports(1, new bn.BN(-1));
  while (true) {
    await pow.round();
    if (pow.found()) {
      console.log([pow.nonce.toString(10), pow.hashString]);
      break;
    }
  }
  })();
*/
