// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// A contract which is/is not art based on the vote of any of its token owners.

contract IsArtContractGriefing is ERC721, ERC721Enumerable {
    event Status(bytes6 is_art);

    bytes6 public is_art;
    
    constructor() ERC721("Is Art (Contract Griefing)", "ISACG") {
        is_art = "is not";
    }

    function toggle() public {
        require(
            balanceOf(msg.sender) > 0,
            "only token holders can toggle state"
        );
        if (is_art == "is") {
            is_art = "is not";
        } else {
            is_art = "is";
        }
        emit Status(is_art);
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
