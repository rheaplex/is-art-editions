/*  IsArtEdition - Ethereum tokens that are or are not something..
    Copyright (C) 2022 Rhea Myers <rhea@myers.studio>

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

import { ethers } from "./ethers.js";
import {
  disableElement, enableElement, hideModal, initNetwork, isValidTokenId,
  showModal, toText
} from "./is-art.js";

let NUM_EDITIONS = 32;
let NUM_ARTIST_PROOFS = 2;
let DEFAULT_TOKEN_ID = 1;

let provider;
let contract;
let tokenId;

let waitForTx;

const toggleBlockchainState = async () => {
  const signer = provider.getSigner();
  // Make a read/write copy of our read-only contract object
  const contractWritable = contract.connect(signer);
  contractWritable.toggle(tokenId)
    .then(tx => provider.waitForTransaction(tx.hash),
          // Metamask will log this, so we don't need to.
          reason => null)
    .then(async () => hideModal("updating"));
};

const onClickShowGui = async () => {
  // Ask Metamask for the user's signing account
  await provider.send("eth_requestAccounts", []);
  showModal("gui");
};

const onClickToggle = async () => {
  hideModal("gui");
  waitForTx = true;
  showModal("updating");
  toggleBlockchainState();
};

const onClickCancel = () => {
  hideModal("gui");
};

const setDisplayState = (state) => {
  document.getElementById("is-art-status").textContent = toText(state);
};

const main = async (event) => {
  [ provider, contract ] = await initNetwork("IsArtToken");

  const id = window.location.hash.substr(1);
  if (isValidTokenId(id, NUM_EDITIONS, NUM_ARTIST_PROOFS)) {
    tokenId = ethers.BigNumber.from(id);
  } else {
    // Reload the page with a working token id
    window.location.hash = DEFAULT_TOKEN_ID;
  }

  setDisplayState(await contract.tokenIsArt(tokenId));

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
