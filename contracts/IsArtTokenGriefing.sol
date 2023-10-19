// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A token for which every nft is/is not art based on a single vote.

contract IsArtTokenGriefing is ERC721, ERC721Enumerable, Pausable, Ownable {
    ////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////

    event Status(bytes6 is_art);

    ////////////////////////////////////////////////////////////////
    // Member variables
    ////////////////////////////////////////////////////////////////

    uint256 public constant NUM_TOKENS = 16;

    // Initial metadata URI.
    string private baseUri = "ipfs://QQQQQQQQQQQQQQQQQQQQQQQQQQQQ";

    bytes6 private is_art;

    ////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////

    constructor() ERC721("Is Art (Token, Griefing)", "ISATG") {
        is_art = "is";
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            _mint(msg.sender, i);
        }
    }

    ////////////////////////////////////////////////////////////////
    // Public API
    ////////////////////////////////////////////////////////////////

    function toggle(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can toggle state"
        );
        if (is_art == "is") {
            is_art = "is not";
        } else {
            is_art = "is";
        }
        emit Status(is_art);
    }

    function tokenIsArt (uint256 tokenId) external view returns (bytes6) {
        _requireMinted(tokenId);
        return is_art;
    }

    ////////////////////////////////////////////////////////////////
    // Public admin-only functions
    ////////////////////////////////////////////////////////////////

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function setBaseUri(string calldata newUri) external onlyOwner {
        baseUri = newUri;
    }

    ////////////////////////////////////////////////////////////////
    // Overrides
    ////////////////////////////////////////////////////////////////

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    )
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
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
