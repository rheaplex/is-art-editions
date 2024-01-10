/*  IsArtTokenDemocratic - Ethereum tokens that can vot on being art.
    Copyright (C) 2023-24 Myers Studio Ltd.

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

const setDisplayStateContract = (is_count, is_percentage, contract_is) => {
  document.getElementById("is-art-status").textContent
    = contract_is ? "is" : "is not";
  let majority = is_count;
  let minority = NUM_EDITIONS - is_count;
  if (!contract_is) {
    [majority, minority] = [minority, majority];
  }
  document.getElementById("majority").textContent = majority;
  document.getElementById("minority").textContent = minority;
};

const setDisplayStateToken = (id, token_is) => {
  document.getElementById("token-status").textContent
    = token_is ? "is" : "is not";
  document.getElementById("token-id").textContent = id;
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenDemocratic");

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

  setDisplayStateToken(tokenId, await contract.tokenIdIsArt(tokenId));

  const toggled = contract.filters.Toggled();

  contract.on(toggled, (id, token_is, is_count, is_percentage, contract_is) => {
    setDisplayStateContract(is_count, is_percentage, contract_is);
    if (id.eq(tokenId)) {
      setDisplayStateToken(id, token_is);
    }
  });

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("toggle-button").onclick = onClickToggle;
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
