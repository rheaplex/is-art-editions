// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// A contract where each token is/is not art based on the conditions set by its owner.

contract IsArtTokenConditional is ERC721, ERC721Enumerable {
    constructor() ERC721("Is Art (Token Conditional)", "ISATC") {}
}
