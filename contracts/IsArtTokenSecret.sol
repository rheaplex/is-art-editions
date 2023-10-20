// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token is/is not art based on the vote of its owner.

contract IsArtTokenSecret is ERC721, ERC721Enumerable, Pausable, Ownable {
    uint256 public constant NUM_TOKENS = 16;

    event Status(uint256 indexed tokenId, bytes32 is_art);

    // Initial metadata URI.
    string private baseUri = "ipfs://Qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

    bytes6[NUM_TOKENS] private is_art;

    constructor() ERC721("Is Art (Token, Secret)", "ISATS") {
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            _mint(msg.sender, i);
        }
    }

    function toggle (uint256 tokenId, bytes32 isHash) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can toggle state"
        );
        uint256 index = tokenId - 1;
        if (is_art[index] == "is") {
            is_art[index] = "is not";
        } else {
            is_art[index] = "is";
        }
        emit Status(tokenId, is_art[index]);
    }

    function tokenIsArt (uint256 tokenId) external view returns (bytes6) {
        _requireMinted(tokenId);
        return is_art[tokenId - 1];
    }

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

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
