// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token is/is not art based on the vote of its owner.

contract IsArtTokenProofOfWork is ERC721, ERC721Enumerable, Pausable, Ownable {
    uint256 public constant NUM_TOKENS = 16;

    event Status(uint256 indexed tokenId, bytes32 is_art, uint256 nonce);

    // Initial metadata URI.
    string private baseUri = "ipfs://";

    bytes32[NUM_TOKENS] private statuses;
    uint256[NUM_TOKENS] private nonces;

    constructor() ERC721("Is Art (Token, Proof of Work)", "ISATPOW") {
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            _mint(msg.sender, i);
        }
    }

    function checkIsArt(uint256 tokenId, uint256 nonce, bytes32 status)
        public
        pure
        returns (bool)
    {
        return (bytes3(status) == bytes3("is\x00"))
            && (sha256(abi.encodePacked(tokenId, nonce)) == status);
    }

    function setIsArt (uint256 tokenId, uint256 nonce, bytes32 status) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can set state"
        );
        require(
            checkIsArt(tokenId, nonce, status),
            "Incorrect parameters"
        );
        uint256 index = tokenId - 1;
        statuses[index] = status;
        nonces[index] = nonce;
        emit Status(tokenId, status, nonce);
    }

    function getIsArt (uint256 tokenId)
        external
        view
        returns (bytes32)
    {
        _requireMinted(tokenId);
        return statuses[tokenId - 1];
    }

    function getNonce (uint256 tokenId)
        external
        view
        returns (uint256)
    {
        _requireMinted(tokenId);
        return nonces[tokenId - 1];
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
