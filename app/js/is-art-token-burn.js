/*  IsArtEdition - Ethereum tokens that are only art if you burn them.
    Copyright (C) 2023 Myers Studio Ltd.

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
  disableElement, enableElement, ensureTokenId,
  hideElement, hideModal, initNetwork,
  showElement, showModal, toText
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
  contractWritable.burn(tokenId)
    .then(tx => provider.waitForTransaction(tx.hash),
          // Metamask will log this, so we don't need to.
          () => null)
    .then(async () => hideModal("updating"));
};

const onClickShowGui = async () => {
  document.getElementById("token-id").textContent = tokenId.toString();
  const tokenIsArt = await contract.tokenIsArt(tokenId);
  if (toText(tokenIsArt) == "is") {
    const logs = await contract.queryFilter(contract.filters.Status(tokenId));
    document.getElementById("last-owner").textContent = logs[0].args.owner;
    disableElement("toggle-button");
    hideElement("other-warning");
    hideElement("owner-warning");
    showElement("burned-warning");
  } else {
    // Ask Metamask for the user's signing account
    const addresses = await provider.send("eth_requestAccounts", []);
    const tokenOwner = await contract.ownerOf(tokenId);
    if (addresses.includes(tokenOwner.toLowerCase())) {
      enableElement("toggle-button");
      hideElement("other-warning");
      showElement("owner-warning");
      hideElement("burned-warning");
    } else {
      disableElement("toggle-button");
      showElement("other-warning");
      hideElement("owner-warning");
      hideElement("burned-warning");
    }
  }
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
  document.getElementById("is-art-status").textContent = toText(state);
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenBurn");

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

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
window.addEventListener("hashchange", () => window.location.reload(), false);
