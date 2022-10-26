// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// A contract which is/is not art based on the votes of its token owners.

contract IsArtContractDemocratic is ERC721, ERC721Enumerable {
    uint256 private constant NUM_TOKENS = 16;
    uint8 private constant THRESHOLD = 8;

    uint8 private isCount = 0;
    bool[NUM_TOKENS] private ises;

    event Toggled(
        uint256 tokenId,
        bool isState,
        uint8 isCount,
        bool isContractArt
    );

    constructor() ERC721("Is Art (Contract Democratic)", "ISACD") {
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            _mint(msg.sender, i);
        }
    }

    function threshold() external pure returns (uint8) {
        return THRESHOLD;
    }
    
    function toggle(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "must own token to toggle");
        bool previousState = ises[tokenId - 1];
        bool newState = ! previousState;
        ises[tokenId - 1] = newState;
        emit Toggled(
            tokenId,
            newState,
            isCount,
            contractIs()
        );
    }

    function tokenIs (uint256 tokenId) external view returns (bool) {
        require(tokenId > 0 && tokenId <= NUM_TOKENS,"no token with tokenId" );
        return ises[tokenId - 1];
    }

    function contractIs () public view returns (bool) {
        return isCount >= THRESHOLD;
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
