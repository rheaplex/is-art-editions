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
  document.getElementById(id).classList.add("is-hidden");
};

export const showElement = (id) => {
  document.getElementById(id).classList.remove("is-hidden");
};

export const enableElement = (id) => {
  document.getElementById(id).disabled = false;
};

export const disableElement = (id) => {
  document.getElementById(id).disabled = true;
};

export const toText = (text) => {
  return ethers.utils.toUtf8String(text).replaceAll("\0", "");
};

export const ensureTokenId = (numEditions, defaultTokenId) => {
  let id = window.location.hash.substr(1);
  if (id === "" || id < 1 || id > numEditions) {
    // Set the page hash to a working token id
    history.pushState(null, null, `#${defaultTokenId}`);
    // Use the working id
    id = defaultTokenId;
  }
  return ethers.BigNumber.from(id);
};

export const fetchContract = async (contractName, provider) => {
  //const chainName = await provider.getNetwork().name;
  //const contractPath = `./js/IsArtToken.sol/${contractName}.${chainName}.json`;
  const contractPath = `./contracts/${contractName}.json`;
  const response = await fetch(contractPath);
  const json = await response.json();
  // Truffle network id may not be chain id.
  const networkId = await provider.send("net_version");
  return new ethers.Contract(
    json.networks[networkId].address,
    json.abi,
    provider
  );
};

export const initNetwork = async (contractName) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Just reload the window if the network changes
  provider.on("chainChanged", () => { window.location.reload(); });
  const contract = await fetchContract(contractName, provider);
  return [ provider, contract ];
};
