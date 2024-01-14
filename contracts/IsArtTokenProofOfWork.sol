// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023-4 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token is/is not art based on the vote of its owner.

contract IsArtTokenProofOfWork is ERC721, ERC721Enumerable, Pausable, Ownable {
    uint256 public constant NUM_TOKENS = 16;

    event Status(
        uint256 indexed tokenId,
        bytes32 is_art,
        uint256 sequence,
        uint256 nonce
    );

    // Initial metadata URI.
    string private baseUri = "ipfs://";

    bytes32[NUM_TOKENS] private statuses;
    uint256[NUM_TOKENS] private sequences;

    constructor () ERC721("Is Art (Token, Proof of Work)", "ISATPOW") {
        for (uint256 i = 0; i < NUM_TOKENS; i++) {
            statuses[i] = bytes32(
                "is\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
            );
            sequences[i] = 1;
            _mint(msg.sender, i + 1);
        }
    }

    function checkIsArt (
        uint256 tokenId,
        uint256 sequence,
        uint256 nonce,
        bytes32 status
    )
        public
        pure
        returns (bool)
    {
        bytes3 target = (sequence % 2 == 0) ? bytes3("not") : bytes3("is\x00");
        return (bytes3(status) == target) &&
            (keccak256(abi.encodePacked(tokenId, sequence, nonce)) == status);
    }

    function setIsArt (
        uint256 tokenId,
        uint256 sequence,
        uint256 nonce,
        bytes32 status
    ) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can set state"
        );
        uint256 index = tokenId - 1;
        require(
            sequence == sequences[index] + 1,
            "Incorrect sequence number"
        );
        require(
            checkIsArt(tokenId, sequence, nonce, status),
            "Incorrect parameters"
        );
        statuses[index] = status;
        sequences[index] = sequence;
        emit Status(tokenId, status, sequence, nonce);
    }

    function getIsArt (uint256 tokenId)
        external
        view
        returns (bytes32)
    {
        _requireMinted(tokenId);
        return statuses[tokenId - 1];
    }

    function getSequence (uint256 tokenId)
        external
        view
        returns (uint256)
    {
        _requireMinted(tokenId);
        return sequences[tokenId - 1];
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
