// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// A contract where each token is/is not art based on the vote of its owner.

contract IsArtToken is ERC721, ERC721Enumerable {
    uint256 private constant NUM_TOKENS = 16;

    event Status(bytes6 is_art, uint256 tokenId);

    bytes6[NUM_TOKENS] private is_art;

    constructor() ERC721("Is Art (Token)", "ISAT") {
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            // Set internal state before interacting with other conacts
            is_art[i - 1] = "is not";
            _mint(msg.sender, i);
        }
    }

    function toggle (uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "only token holder can toggle state"
        );
        uint256 index = tokenId - 1;
        if (is_art[index] == "is") {
            is_art[index] = "is not";
        } else {
            is_art[index] = "is";
        }
        emit Status(is_art[index], tokenId);
    }

    function tokenIsArt (uint256 tokenId) external view returns (bytes6) {
        require(tokenId > 0 && tokenId <= NUM_TOKENS, "no token with tokenId" );
        return is_art[tokenId - 1];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
