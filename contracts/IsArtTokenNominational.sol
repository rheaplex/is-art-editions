// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// A contract where each token nominates another ERC721 token as art/not art for its owner.

contract IsArtTokenNominational is ERC721, ERC721Enumerable {
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
    
    struct Nomination {
        address tokenContract;
        uint256 tokenId;
    }

    // A mapping of our NFT ids to nomination records
    mapping(uint256 => Nomination) private nominations;

    constructor() ERC721("Is Art (Token Nominational)", "ISATN") {}

    function nominationForTokenId(uint256 tokenId)
        external
        view
        returns (Nomination memory)
    {
        require(
            _exists(tokenId),
            "no such token"
        );
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
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
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
