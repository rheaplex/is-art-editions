/*  IsArtTokenNominational - Other Ethereum tokens that are art.
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
  ensureTokenId, enableElementForOwner, hideModal, initNetwork,
  showModal
} from "./is-art.js";

let NUM_EDITIONS = 16;
let DEFAULT_TOKEN_ID = 1;

let provider;
let contract;
let tokenId;

const nominateBlockchainState = async () => {
  const signer = provider.getSigner();
  // Make a read/write copy of our read-only contract object
  const contractWritable = contract.connect(signer);
  contractWritable.nominate(
    tokenId,
    document.getElementById("contract").value,
    document.getElementById("token").value
  ).then(tx => provider.waitForTransaction(tx.hash),
          // Metamask will log this, so we don't need to.
          () => null)
    .then(async () => hideModal("updating"));
};

const deNominateBlockchainState = async () => {
  const signer = provider.getSigner();
  // Make a read/write copy of our read-only contract object
  const contractWritable = contract.connect(signer);
  contractWritable.deNominate(tokenId)
    .then(tx => provider.waitForTransaction(tx.hash),
          // Metamask will log this, so we don't need to.
          () => null)
    .then(async () => hideModal("updating"));
};

const onClickShowGui = async () => {
  // Ask Metamask for the user's signing account
  await provider.send("eth_requestAccounts", []);
  const currentNomination = await contract.nominationForTokenId(tokenId);
  document.getElementById("contract").value = currentNomination.tokenContract;
  document.getElementById("token").value
    = currentNomination.tokenId.toString() || "0";
  enableElementForOwner("nominate-button", provider, contract, tokenId);
  enableElementForOwner("denominate-button", provider, contract, tokenId);
  showModal("gui");
};

const onClickNominate = async () => {
  hideModal("gui");
  showModal("updating");
  nominateBlockchainState();
};

const onClickDeNominate = async () => {
  hideModal("gui");
  showModal("updating");
  deNominateBlockchainState();
};

const onClickCancel = () => {
  hideModal("gui");
};

const setDisplayState = async() => {
  const metadataUri = await contract.nominatedTokenURI(tokenId);
  if (metadataUri !== "") {
    const metadata = await (await fetch(
      metadataUri,
      { mode: "cors",
        method: "GET",
        headers: {
          "Accept": "application/json",
        }
      })).json();
    const tokenImageUri = metadata["image"];
    document.body.style.backgroundImage = `url(${tokenImageUri})`;
  } else {
    document.body.style.backgroundImage = "none";
  }
};

const main = async (/*event*/) => {
  [ provider, contract ] = await initNetwork("IsArtTokenNominational");

  tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

  setDisplayState();

  let status = contract.filters.Nominated(tokenId);
  contract.on(status, () => setDisplayState() );
  status = contract.filters.DeNominated(tokenId);
  contract.on(status, () => setDisplayState() );

  document.getElementById("representation").onclick = onClickShowGui;
  document.getElementById("denominate-button").onclick = onClickDeNominate;
  document.getElementById("nominate-button").onclick = onClickNominate;
  document.getElementById("cancel-button").onclick = onClickCancel;
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
