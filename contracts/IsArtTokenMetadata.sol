// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";

// A contract where each token's metadata is/is not art based on the vote
// of its owner.

contract IsArtTokenMetadata
is ERC721, ERC721Enumerable, IERC4906, Pausable, Ownable
{
    using Strings for uint256;

    uint256 public constant NUM_TOKENS = 16;

    // Initial metadata URI.
    string private baseUri = "ipfs://bafybeiguj5bmzs4zd4w7s5pwqmbmuxgkhv77t3d3xw4xwwe4hys5c5aot4/IsArtTokenMetadata/";

    bytes6[NUM_TOKENS] private is_art;
    constructor() ERC721("Is Art (Token Metadata)", "ISATM") {

        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            // Set internal state before interacting with other conacts
            is_art[i - 1] = "is not";
            _mint(msg.sender, i);
        }
        emit BatchMetadataUpdate(1, NUM_TOKENS);
    }

    function toggleMetadata (uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can toggle metadata state"
        );
        uint256 index = tokenId - 1;
        if (is_art[index] == "is") {
            is_art[index] = "is not";
        } else {
            is_art[index] = "is";
        }
        emit MetadataUpdate(tokenId);
    }

    function tokenMetadataIsArt (uint256 tokenId)
        external
        view
        returns (bytes6)
    {
        _requireMinted(tokenId);
        return is_art[tokenId - 1];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        _requireMinted(tokenId);
        string memory dir;
        if (is_art[tokenId - 1] == "is") {
            dir = "is";
        } else {
            dir = "is-not";
        }
        return string.concat(baseUri, dir, "/", tokenId.toString());
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
        override(IERC165, ERC721, ERC721Enumerable)
        returns (bool)
    {
        return interfaceId == bytes4(0x49064906) ||
            super.supportsInterface(interfaceId);
    }
}
