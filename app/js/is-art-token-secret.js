/*  IsArtTokenSecret - Ethereum tokens that are art or not in secret.
    Copyright (C) 2023-4 Myers Studio, Ltd.

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
  ensureTokenId, hideModal, initNetwork,
  showModal, toText
} from "./is-art.js";

let NUM_EDITIONS = 16;
let DEFAULT_TOKEN_ID = 1;

let provider;
let contract;
let tokenId;

// Copy and paste antipattern.

// Yes, I know. This isn't remotely serious cryptography.
// DO NOT USE ANY PART OF THIS ELSEWHERE!!!!!

function mod(n, m) {
  return ((n % m) + m) % m;
}

function encrypt(address, tokenId, nonce, status) {
  address = address.toUpperCase().split("").reverse().join("");
  status = status.padEnd(32, "\0");
  let result = [];
  for (let i = 0; i < status.length; i++) {
    result.push(
      mod(
        status.charCodeAt(i)
          + tokenId.toNumber()
          + nonce
          + address.charCodeAt(mod(i, address.length)),
        256)
    );
  }
  return result;
}

function decrypt(address, tokenId, nonce, ciphertext) {
  address = address.toUpperCase().split("").reverse().join("");
  let result = [];
  for (let i = 0; i < ciphertext.length; i++) {
    result.push(
      String.fromCharCode(
        mod(
          ciphertext[i]
            - tokenId.toNumber()
            - nonce
            - address.charCodeAt(mod(i, address.length)),
          256)
      )
    );
  }
  return result.join('').replace(/\0+$/, "");
}

const toggleBlockchainState = async () => {
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const status = document.getElementById("is-art-status").textContent
        == "is" ? "is not" : "is";
  const ciphertext = encrypt(
    address,
    tokenId,
    await provider.getTransactionCount(address),
    status
  );
  // Make a read/write copy of our read-only contract object
  const contractWritable = contract.connect(signer);
  contractWritable.toggle(tokenId, ciphertext)
    .then(tx => provider.waitForTransaction(tx.hash),
          // Metamask will log this, so we don't need to.
          () => null)
    .then(async () => hideModal("updating"));
};

const onClickShowGui = async () => {
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  if (address == await contract.ownerOf(tokenId)) {
    showModal("gui");
  }
};

const onClickToggle = async () => {
  hideModal("gui");
  showModal("updating");
  toggleBlockchainState();
};

const onClickCancel = () => {
  hideModal("gui");
};

const setDisplayState = async (id, is_art, event) => {
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const tx = await provider.getTransaction(event.transactionHash);
  document.getElementById("is-art-status").textContent =
    decrypt(
      address,
      tokenId,
      tx.nonce,
      ethers.utils.arrayify(is_art)
    );
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenSecret");

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

  const status = contract.filters.Status(
    tokenId,
    null
  );

  const recents = await contract.queryFilter(status, null, "latest");
  const latest = recents[recents.length - 1];
  setDisplayState(
    latest.args.id,
    latest.args.is_art,
    latest
  );

  contract.on(status, (id, is_art, event) => {
    setDisplayState(id, is_art, event);
  });

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("toggle-button").onclick = onClickToggle;
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
