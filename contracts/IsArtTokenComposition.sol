// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// A contract where each token is/is not art based on the vote of its owner.

contract IsArtTokenComposition
is ERC721, ERC721Enumerable, Pausable, Ownable, ReentrancyGuard
{
    uint256 public constant NUM_PARENT_TOKENS = 16;
    uint256 public constant NUM_CHILD_SLOTS = 6;
    uint256 public constant NUM_CHILD_TOKENS = NUM_PARENT_TOKENS * NUM_CHILD_SLOTS;
    uint256 public constant NUM_TOKENS = NUM_PARENT_TOKENS + NUM_CHILD_TOKENS;

    uint8 public constant PARENT_KIND = 112;
    uint8 public constant CHILD_KIND = 107;

    uint256 private constant CHILD_OFFSET = NUM_PARENT_TOKENS + 1;

    event Status(uint256 indexed tokenId, bytes6 is_art);

    // Initial metadata URI.
    string private baseUri = "ipfs://qqqqqqqqqqqqqqqqqqqqqqqqqqqq";

    uint256[NUM_CHILD_TOKENS] private parent;
    uint256[NUM_CHILD_SLOTS][NUM_PARENT_TOKENS] private children;

    constructor() ERC721("Is Art (Token, Composition)", "ISATC") {}

    function mintTokens(
        uint256[] calldata tokenIds,
        uint256[] calldata parentIds,
        uint256[] calldata childIndexes
    ) public onlyOwner {
        require(
            tokenIds.length + totalSupply() <= NUM_TOKENS,
            "This would mint too many tokens"
        );
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            _mint(msg.sender, tokenId);
            uint256 parentId = parentIds[i];
            if (parentId != 0) {
                parent[serialOf(tokenId) - CHILD_OFFSET] = parentId;
                uint256 parentIndex = serialOf(parentId) - 1;
                children[parentIndex][childIndexes[i]] = tokenId;
            }
        }
    }

    function kindOf(uint256 tokenId) public pure returns (uint8) {
        return uint8(tokenId >> (64 + 80));
    }

    function serialOf(uint256 tokenId) public pure returns (uint64) {
        return uint64(tokenId >> 80);
    }

    function textOf(uint tokenId) public pure returns (string memory value) {
        bytes10 source = bytes10(uint80(tokenId & 0xFFFFFFFFFFFFFFFFFFFF));
        uint256 from = 0;
        for (; from < 10; from++) {
            if (source[from] != 0) {
                break;
            }
        }
        uint256 length = 10 - from;
        value = new string(length);
        for (uint256 i = 0; i < length; i++) {
            bytes(value)[i] = source[from];
            from++;
        }
    }

    function tokenIsArt(uint256 tokenId)
        public
        view
        returns (string memory is_art)
    {
        // ownerOf() throws if the token doesn't exist, this just documents it.
        require(
            ownerOf(tokenId) != address(0),
            "No such token."
        );
        is_art = textOf(tokenId);
        if (kindOf(tokenId) == PARENT_KIND) {
            uint256 serial = uint256(serialOf(tokenId));
            uint256 index = serial - 1;
            for (uint256 i = 0; i < NUM_CHILD_SLOTS; i++) {
                uint256 child = children[index][i];
                if(child != 0) {
                    is_art = string.concat(is_art, ' ', textOf(child));
                }
            }
        }
    }

    function parentOf(uint256 tokenId) public view returns (uint256) {
        require(kindOf(tokenId) == CHILD_KIND, "Not a child token");
        return parent[serialOf(tokenId) - CHILD_OFFSET];
    }

    function childrenOf(uint256 tokenId)
        public
        view
        returns (uint256[NUM_CHILD_SLOTS] memory)
    {
        require(kindOf(tokenId) == PARENT_KIND, "Not a parent token");
        return children[serialOf(tokenId) - 1];
    }

    function detachChild(uint256 parentId, uint256 childIndex) public {
        require(
            ownerOf(parentId) == msg.sender,
            "Only parent owner can do that"
        );
        require(childIndex < NUM_CHILD_SLOTS, "Invalid childIndex");
        uint256 parentIndex = serialOf(parentId) - 1;
        uint256 childId = children[parentIndex][childIndex];
        require(childId != 0, "No child token in slot");
        require(
            ownerOf(childId) == msg.sender,
            "Only child owner can do that"
        );
        parent[serialOf(childId) - CHILD_OFFSET] = 0;
        children[parentIndex][childIndex] = 0;
    }

    function attachChild(
        uint256 parentId,
        uint256 childId,
        uint256 childIndex
    ) public {
        require(
            ownerOf(parentId) == msg.sender,
            "Only parent owner can do that"
        );
        require(
            ownerOf(childId) == msg.sender,
            "Only child owner can do that"
        );
        require(childIndex < NUM_CHILD_SLOTS, "Invalid childIndex");
        require (parent[childIndex] != 0, "Child is already attached.");
        uint256 parentIndex = serialOf(parentId) - 1;
        parent[serialOf(childId) - CHILD_OFFSET] = parentId;
        children[parentIndex][childIndex] = childId;
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

    function _afterTokenTransfer(
        address /*from*/,
        address to,
        uint256 firstTokenId,
        uint256 /*batchSize*/
    )
        internal
        virtual
        override
        nonReentrant
    {
        // Note that if the transfer succeeded, the transfer was valid.
        // We therefore transfer any attached child tokens as well.
        if (kindOf(firstTokenId) == PARENT_KIND) {
            uint256 parentIndex = serialOf(firstTokenId) - 1;
            for (uint256 i = 0; i < NUM_CHILD_SLOTS; i++) {
                uint256 childId = children[parentIndex][i];
                if (childId != 0) {
                    // Allow transfers when parent is authed.
                    //address previousOwner =
                    _transfer(msg.sender, to, childId);
                    /*if (previousOwner != from) {
                      revert ERC721IncorrectOwner(
                      from,
                      tokenId,
                      previousOwner
                      );
                      }*/
                }
            }
        }
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
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
