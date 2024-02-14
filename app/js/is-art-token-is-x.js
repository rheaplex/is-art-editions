/*  IsArtEdition - Ethereum tokens that are or are not something..
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

import {
  ensureTokenId, hideModal, initNetwork,
  showModal, toText
} from "./is-art.js";

let NUM_EDITIONS = 16;
let DEFAULT_TOKEN_ID = 1;

let provider;
let contract;
let tokenId;

const setBlockchainState = async (newIs) => {
  const signer = provider.getSigner();
  // Make a read/write copy of our read-only contract object
  const contractWritable = contract.connect(signer);
  contractWritable.setIs(tokenId, newIs)
    .then(tx => provider.waitForTransaction(tx.hash),
          // Metamask will log this, so we don't need to.
          () => null)
    .then(async () => hideModal("updating"));
};

const onClickShowGui = async () => {
  // Ask Metamask for the user's signing account
  await provider.send("eth_requestAccounts", []);
  const currentIs = await contract.tokenIs(tokenId);
  const select = document.getElementById("new-is");
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value == currentIs) {
      select.options[i].selected = true;
    } else {
      select.options[i].selected = false;
    }
  }
  showModal("gui");
};

const onClickToggle = async () => {
  hideModal("gui");
  showModal("updating");
  const select = document.getElementById("new-is");
  const newIs = parseInt(select.options[select.selectedIndex].value, 10);
  setBlockchainState(newIs);
};

const onClickCancel = () => {
  hideModal("gui");
};

const setDisplayState = (state) => {
  document.getElementById("is-art-status").textContent = state;
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenIsX");

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);
  
  setDisplayState(await contract.tokenIs(tokenId));

  const status = contract.filters.Is(
    tokenId,
    null
  );

  contract.on(status, (id, token_is) => {
    setDisplayState(token_is);
  });

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("toggle-button").onclick = onClickToggle;
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
