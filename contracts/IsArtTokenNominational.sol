// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token nominates another ERC721 token as art/not art.

contract IsArtTokenNominational is ERC721, ERC721Enumerable, Pausable, Ownable {
    ////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////
    event Nominated(
        uint256 tokenId,
        address nominatedTokenContract,
        uint256 nominatedTokenId,
        address by
    );
    event DeNominated(
        uint256 tokenId,
        address nominatedTokenContract,
        uint256 nominatedTokenId,
        address by
    );

    ////////////////////////////////////////////////////////////////
    // Structs
    ////////////////////////////////////////////////////////////////
    
    struct Nomination {
        address tokenContract;
        uint256 tokenId;
    }

    ////////////////////////////////////////////////////////////////
    // Constants
    ////////////////////////////////////////////////////////////////
    
    uint256 public constant NUM_TOKENS = 16;

    ////////////////////////////////////////////////////////////////
    // Member variables
    ////////////////////////////////////////////////////////////////

    // Initial metadata URI.
    string private baseUri = "ipfs://QQQQQQQQQQQQQQQQQQQQQQQQQQQQ";
    // A mapping of our NFT ids to nomination records
    mapping(uint256 => Nomination) private nominations;

    ////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////

    constructor() ERC721("Is Art (Token, Nominational)", "ISATN") {}

    ////////////////////////////////////////////////////////////////
    // Public API
    ////////////////////////////////////////////////////////////////

    function nominationForTokenId(uint256 tokenId)
        external
        view
        returns (Nomination memory)
    {
        require(_exists(tokenId), "no such token");
        return nominations[tokenId];
    }
    
    function nominate (
        uint256 tokenId,
        address contractAddressToNominate,
        uint256 tokenIdToNominate
    )
        public
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "you don't own that tokenId"
        );
        ERC721 erc721 = ERC721(contractAddressToNominate);
        require(
            erc721.supportsInterface(type(IERC721).interfaceId),
            "not an ERC721 token contract"
        );
        require(
            erc721.ownerOf(tokenId) == msg.sender,
            "you don't own that external token"
        );
        nominations[tokenId] = Nomination(
            contractAddressToNominate,
            tokenIdToNominate
        );
        emit Nominated(
            tokenId,
            contractAddressToNominate,
            tokenIdToNominate,
            msg.sender
        );
    }

    function deNominate (
        uint256 tokenId,
        address nominatedContractAddress,
        uint256 nominatedTokenId
    )
        public
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "you don't own that tokenId"
        );
        require(
            nominations[tokenId].tokenContract != address(0),
            "that external token isn't nominated"
        );
        delete nominations[tokenId];
        emit DeNominated(
            tokenId,
            nominatedContractAddress,
            nominatedTokenId,
            msg.sender
        );
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
