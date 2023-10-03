/*  IsArtEdition - Ethereum tokens that are or are not something..
    Copyright (C) 2023 Rhea Myers <rhea@myers.studio>

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
let FIELD_MIN = 0;
let FIELD_MAX = 15;

let provider;
let contract;
let tokenId;

const setOption = (id, value) => {
  const select = document.getElementById(id);
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value == value) {
      select.options[i].selected = true;
    } else {
      select.options[i].selected = false;
    }
  }
};

const getOption = (id) => {
  const select = document.getElementById(id);
  return parseInt(select.options[select.selectedIndex].value, 10);
};

const setBlockchainDefinition = async () => {
  const signer = provider.getSigner();
  // Make a read/write copy of our read-only contract object
  const contractWritable = contract.connect(signer);
  contractWritable.setDefinition(
    tokenId,
    getOption("extent"),
    getOption("connection"),
    getOption("relation"),
    getOption("subject")
  ).then(tx => provider.waitForTransaction(tx.hash),
         // Metamask will log this, so we don't need to.
         () => null)
    .then(async () => hideModal("updating"));
};

const onClickShowGui = async () => {
  // Ask for the user's signing account
  await provider.send("eth_requestAccounts", []);
  const description = await contract.getDefinitionData(tokenId);
  setOption("extent", description.extent.toNumber());
  setOption("connection", description.connection.toNumber());
  setOption("relation", description.relation.toNumber());
  setOption("subject", description.subjectCD.toNumber());
  showModal("gui");
};

const onClickUpdate = async () => {
  hideModal("gui");
  showModal("updating");
  setBlockchainDefinition();
};

const onClickCancel = () => {
  hideModal("gui");
};

const setDefinition = async () => {
  document.getElementById("is-art-definition").textContent =
    await contract.getDefinitionText(tokenId);
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenIsX");

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

  await setDefinition();

  const descriptionChanged = contract.filters.DefinitionChanged(
    tokenId,
    null
  );

  contract.on(descriptionChanged, setDefinition);

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("toggle-button").onclick = onClickUpdate;
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
