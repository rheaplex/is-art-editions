/*  IsArtTokenComposition - Ethereum tokens that can add up to art.
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
  ensureTokenId, hideModal, initNetwork,
  showModal
} from "./is-art.js";

const PARENT_IDS = ["0x70000000000000000100000000000074686973","0x70000000000000000200000000000074686973","0x70000000000000000300000000000074686973","0x70000000000000000400000000000074686973","0x70000000000000000500000000000074686973","0x70000000000000000600000000000074686973","0x70000000000000000700000000000074686973","0x70000000000000000800000000000074686973","0x70000000000000000900000000000074686973","0x70000000000000000a00000000000074686973","0x70000000000000000b00000000000074686973","0x70000000000000000c00000000000074686973","0x70000000000000000d00000000000074686973","0x70000000000000000e00000000000074686973","0x70000000000000000f00000000000074686973","0x70000000000000001000000000000074686973"];

let NUM_EDITIONS = 16;
let DEFAULT_TOKEN_ID = 1;

let provider;
let contract;
let tokenId;

const onClickShowGui = async () => {
  // Ask Metamask for the user's signing account
  await provider.send("eth_requestAccounts", []);
  showModal("gui");
};

const onClickCancel = () => {
  hideModal("gui");
};

const onSelectToken = (event) => {
  hideModal("gui");
  window.location.hash = event.target.value;
  location.reload();
};

const setDisplayState = (state) => {
  document.getElementById("is-art").textContent = state;
};

const populateTokenSelect = () => {
  const select = document.getElementById("tokens");
  for (let i = 0; i < PARENT_IDS.length; i++) {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.text = PARENT_IDS[i];
    select.add(opt, null);
  }
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenComposition");

  tokenId = PARENT_IDS[ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID) - 1];

  setDisplayState(await contract.tokenIsArt(tokenId));

  const status = contract.filters.Status(
    tokenId,
    null
  );

  contract.on(status, (id, is_art) => {
    setDisplayState(is_art);
  });

  populateTokenSelect();

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("tokens").addEventListener("change", onSelectToken);
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
