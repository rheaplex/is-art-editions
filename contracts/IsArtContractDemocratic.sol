// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// A contract which is/is not art based on the votes of its token owners.

contract IsArtContractDemocratic is ERC721, ERC721Enumerable {
    constructor() ERC721("Is Art (Contract Democratic)", "ISACD") {}
}
