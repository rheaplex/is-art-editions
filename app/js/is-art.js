/*  IsArt - Base code for Ethereum contracts that are or are not art.
    Copyright (C) 2015, 2016, 2017, 2019, 2022 Rhea Myers <rhea@myers.studio>

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

export const hideModal = (id) => {
  document.getElementById(id).classList.remove("is-active");
};

export const showModal = (id) => {
  document.getElementById(id).classList.add("is-active");
};

export const hideElement = (id) => {
  document.getElementById(id).classList.remove("is-hidden");
};

export const showElement = (id) => {
  document.getElementById(id).classList.add("is-hidden");
};

export const enableElement = (id) => {
  document.getElementById(id).disabled = false;
};

export const disableElement = (id) => {
  document.getElementById(id).disabled = true;
};

export const toText = (text) => {
  return ethers.utils.toUtf8String(text);//.replace(/\0+$/, "");
};

export const ensureTokenId = (numEditions, defaultTokenId) => {
  const id = window.location.hash.substr(1);
  if (id < 1 || id > numEditions) {
    // Reload the page with a working token id
    window.location.replace(window.location.pathname + `#${defaultTokenId}`);
  }
  return ethers.BigNumber.from(id);
};

export const initNetwork = async (contractName) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Just reload the window if the network changes
  provider.on("chainChanged", () => { window.location.reload(); });
  //const chainName = await provider.getNetwork().name;
  //const contractPath = `./js/IsArtToken.sol/${contractName}.${chainName}.json`;
  const contractPath = `./contracts/${contractName}.json`;
  const response = await fetch(contractPath);
  const json = await response.json();
  /* const contract = new ethers.Contract(
    json.address,
    json.abi,
    provider
  );*/
  const contract = new ethers.Contract(
    json.networks[(await provider.getNetwork()).chainId].address,
    json.abi,
    provider
  );
  return [ provider, contract ];
};
