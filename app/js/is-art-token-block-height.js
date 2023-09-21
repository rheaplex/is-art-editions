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

import {
  initNetwork, ensureTokenId, toText
} from "./is-art.js";

let NUM_EDITIONS = 16;
let DEFAULT_TOKEN_ID = 1;

const setDisplayState = (state) => {
  document.getElementById("is-art-status").textContent = toText(state);
};

const main = async (/*event*/) => {
  let [ provider, contract ] = await initNetwork("IsArtTokenBlockHeight");

  let tokenId = ensureTokenId(NUM_EDITIONS, DEFAULT_TOKEN_ID);

  // We get the current block as the first block to the block event handler.
  //setDisplayState(await contract.tokenIsArt(tokenId));

  provider.on("block", async (/*blockNumber*/) => {
    // Note that we don't use the block number here. Should we?
    setDisplayState(await contract.tokenIsArt(tokenId));
  });
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("hashchange", () => window.location.reload(), false);
