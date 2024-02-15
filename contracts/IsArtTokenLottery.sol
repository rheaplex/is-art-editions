// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

/* solium-disable security/no-block-members */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token is/is not art based on the vote of its owner.

contract IsArtTokenLottery is ERC721, ERC721Enumerable, Pausable, Ownable {
    uint256 public constant NUM_TOKENS = 16;

    event Status(
        uint256 indexed tokenId,
        bytes6 is_art,
        bytes6 was_art,
        address by,
        bytes32 a, uint b, uint c
    );

    // Initial metadata URI.
    string private baseUri = "ipfs://bafybeiguj5bmzs4zd4w7s5pwqmbmuxgkhv77t3d3xw4xwwe4hys5c5aot4/IsArtTokenLottery/";

    bytes6[NUM_TOKENS] private is_art;

    constructor() ERC721("Is Art (Token, Lottery)", "ISATL") {
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            // Set internal state before interacting with other contracts.
            is_art[i - 1] = "is not";
            _mint(msg.sender, i);
        }
    }

    function toggle (uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can toggle state"
        );
        uint256 index = tokenId - 1;
        bytes6 previous = is_art[index];
        // This is weak but works for our purposes.
        uint256 rnd = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.difficulty)
            )) % 2;
        if (rnd == 1) {
            is_art[index] = "is not";
        } else {
            is_art[index] = "is";
        }
        emit Status(
            tokenId,
            is_art[index],
            previous,
            msg.sender,
            keccak256(
                abi.encodePacked(block.timestamp, block.difficulty)
            ),
            block.timestamp,
            block.difficulty);
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
