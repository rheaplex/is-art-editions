// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token nominates another ERC721 token as art/not art.

contract IsArtTokenNominational is ERC721, ERC721Enumerable, Pausable, Ownable {
    ////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////

    event Nominated(
        uint256 indexed tokenId,
        address nominatedTokenContract,
        uint256 nominatedTokenId,
        address indexed by
    );

    event DeNominated(
        uint256 indexed tokenId,
        address nominatedTokenContract,
        uint256 nominatedTokenId,
        address indexed by
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

    constructor() ERC721("Is Art (Token, Nominational)", "ISATN") {
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            _mint(msg.sender, i);
        }
    }

    ////////////////////////////////////////////////////////////////
    // Public API
    ////////////////////////////////////////////////////////////////

    function nominationForTokenId(uint256 tokenId)
        external
        view
        returns (Nomination memory)
    {
        require(_exists(tokenId), "no such token");
        return nominations[tokenId - 1];
    }

    function nominate (
        uint256 tokenId,
        address contractAddressToNominate,
        uint256 tokenIdToNominate
    )
        public
    {
        require(
            _exists(tokenId) &&
            (_ownerOf(tokenId) == msg.sender),
            "You don't own that tokenId"
        );
        ERC721 erc721 = ERC721(contractAddressToNominate);
        // This will revert if not a contract, which is good.
        require(
            erc721.supportsInterface(type(IERC721).interfaceId),
            "Not an ERC721 token contract"
        );
        // This usually checks for existence as well.
        require(
            erc721.ownerOf(tokenIdToNominate) == msg.sender,
            "You don't own that external token"
        );
        nominations[tokenId - 1] = Nomination(
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
            "You don't own that tokenId"
        );
        require(
            nominations[tokenId - 1].tokenContract != address(0),
            "That external token isn't nominated"
        );
        delete nominations[tokenId - 1];
        emit DeNominated(
            tokenId,
            nominatedContractAddress,
            nominatedTokenId,
            msg.sender
        );
    }

    /*
      Utility to get the metadata URI, if any, of the nominated token
      for the tokenId in *this* contract that nominated it.
      This will revert if the token doesn't suppport ERC721Metadata!
    */

    function nominatedTokenURI (uint256 tokenId)
        external
        view
        returns (string memory uri)
    {
        require(_exists(tokenId), "No such tokenId");
        Nomination storage nomination = nominations[tokenId - 1];
        if (nomination.tokenContract != address(0x0)) {
            IERC721Metadata erc721m = IERC721Metadata(nomination.tokenContract);
            uri = erc721m.tokenURI(nomination.tokenId);
        } else {
            uri = "";
        }
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
