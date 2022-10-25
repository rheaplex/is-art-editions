// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// A contract where each token is set to be/not be part of/a comment on/a critique of/etc. an artwork by the token owner.

contract IsArtTokenXIsRelational is ERC721, ERC721Enumerable {
    constructor() ERC721("Is Art (Token X Is Relational)", "ISATXIR") {}
}
