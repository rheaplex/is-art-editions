/*  IsArtEdition - Ethereum tokens that are art if the original contract is.
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

import {
  ensureTokenId, fetchContract, hideModal, initNetwork,
  showModal, toText
} from "./is-art.js";

let NUM_EDITIONS = 16;
let DEFAULT_TOKEN_ID = 1;

let provider;
let contract;
let tokenId;

const toggleBlockchainState = async () => {
  const signer = provider.getSigner();
  // Make a read/write copy of our read-only contract object
  const contractWritable = contract.connect(signer);
  contractWritable.toggle(tokenId)
    .then(tx => provider.waitForTransaction(tx.hash),
          // Metamask will log this, so we don't need to.
          () => null)
    .then(async () => hideModal("updating"));
};

const onClickShowGui = async () => {
  // Ask Metamask for the user's signing account
  await provider.send("eth_requestAccounts", []);
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
  const text = toText(state);
  const stateElement = document.getElementById("is-art-status");
  // Make sure we don't set the text if it's already the same,
  // e.g. for Status events following StatusProxy events.
  if (stateElement.textContent != text) {
    stateElement.textContent = text;
  }
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenProxy");
  const isArtOriginal = await fetchContract("IsArt", provider);

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

  setDisplayState(await contract.tokenIsArt(tokenId));

  const proxyStatus = contract.filters.ProxyStatus(
    tokenId,
    null
  );

  contract.on(proxyStatus, (id, is_art) => {
    setDisplayState(is_art);
  });

  // This will catch our own updates, but these will be filtered out by
  // setDisplayStatus.

  const originalStatus = isArtOriginal.filters.Status();

  isArtOriginal.on(originalStatus, (is_art) => {
    setDisplayState(is_art);
  });

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("toggle-button").onclick = onClickToggle;
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
