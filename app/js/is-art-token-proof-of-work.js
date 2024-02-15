/*  IsArtTokenProofOfWork - Ethereum tokens that are art if you work for it.
    Copyright (C) 2022 Rhea Myers <rhea@myers.studio>
    Copyright (C) 2024 Myers Studio, Ltd.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { ethers } from "./ethers-5.1.esm.min.js";

import {
  ensureTokenId, enableElementForOwner, hideModal, initNetwork,
  showModal, toText
} from "./is-art.js";

let NUM_EDITIONS = 16;
let DEFAULT_TOKEN_ID = 1;

// Copy and paste antipattern.

const IS = "is\0".split("");
const IS_NOT = "is not\0".split("");

class ProofOfWork {

  constructor (tokenId, sequence, initialNonce) {
    this.tokenId = tokenId;
    this.sequence = sequence;
    this.nonce = initialNonce;
    this.hashBytes = "   ";
    this.target = this.sequence % 2 == 0 ? IS : IS_NOT;
    this.decoder = new TextDecoder("ascii");
  }

  async round () {
    this.nonce = this.nonce.add(1);
    this.hashHex = ethers.utils.solidityKeccak256(
      [ "uint256", "uint256", "uint256" ],
      [ this.tokenId, this.sequence, this.nonce ]
    );
    this.hashBytes = ethers.utils.arrayify(this.hashHex);
    this.hashText = this.decoder.decode(this.hashBytes);
  }

  found () {
    let result = true;
    for (let i = 0; i < this.target.length; i++) {
      if (this.hashBytes[i] != this.target[i]) {
        result = false;
        break;
      }
    }
    return result;
  }

}

let provider;
let contract;
let tokenId;
let pow;

const initPow = async () => {
  showModal("calculating");
  pow = new ProofOfWork(
    tokenId,
    (await contract.getSequence(tokenId)).add(1),
    ethers.BigNumber.from(0)
  );
};

function findPow() {
  pow.round();
  document.getElementById("nonce").textContent = pow.nonce;
  if (! pow.found()) {
    setTimeout(findPow, 0);
  } else {
    hideModal("calculating");
    const signer = provider.getSigner();
      // Make a read/write copy of our read-only contract object
      const contractWritable = contract.connect(signer);
      contractWritable.setIsArt(tokenId, pow.nonce, pow.hashText)
        .then(tx => provider.waitForTransaction(tx.hash),
              // Metamask will log this, so we don't need to.
              () => null)
      .then(async () => hideModal("updating"));
    pow = undefined;
  }
}

const toggleBlockchainState = async () => {
  await initPow();
  findPow();
};

const onClickShowGui = async () => {
  // Ask Metamask for the user's signing account
  await provider.send("eth_requestAccounts", []);
  enableElementForOwner("toggle-button", provider, contract, tokenId);
  showModal("gui");
};

const onClickToggle = async () => {
  hideModal("gui");
  showModal("updating");
  toggleBlockchainState();
};

const onClickCancel = () => {
  hideModal("gui");
};

const setDisplayState = (state) => {
  document.getElementById("is-art-status").textContent =
    toText(state).substring(0, 3) == "is" ? "is" : "is not";
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenProofOfWork");

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

  setDisplayState(await contract.getIsArt(tokenId));

  const status = contract.filters.Status(
    tokenId,
    null
  );

  contract.on(status, (id, is_art) => {
    setDisplayState(is_art);
  });

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("toggle-button").onclick = onClickToggle;
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
