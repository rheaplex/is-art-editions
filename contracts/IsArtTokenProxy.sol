// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IIsArt.sol";

// A contract where all tokens are/are not art based on the original contract.

contract IsArtTokenProxy is ERC721, ERC721Enumerable, Pausable, Ownable {
    uint256 public constant NUM_TOKENS = 16;

    address private originalContract;

    event ProxyStatus(uint256 indexed tokenId, bytes6 is_art);

    // Initial metadata URI.
    string private baseUri = "ipfs://bafybeiglmvres2ac2nyxvsxcxl57ohaxrlkgyils3c2rz2ljtwtmv3xc6m/IsArtTokenProxy/";

    constructor(address original)
        ERC721("Is Art (Token, Proxy)", "ISATP")
    {
        originalContract = original;
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            _mint(msg.sender, i);
        }
    }

    function toggle (uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can toggle state"
        );

        IIsArt original = IIsArt(originalContract);
        original.toggle();
        emit ProxyStatus(tokenId, original.is_art());
    }

    function tokenIsArt (uint256 tokenId) external view returns (bytes6) {
        _requireMinted(tokenId);
        IIsArt original = IIsArt(originalContract);
        return original.is_art();
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
