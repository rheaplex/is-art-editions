// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2017   Rhea Myers
// Copyright:               2023-4 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token is set to be/not be art because ...
// using the 'Art Is' controlled grammar by the token owner.

contract IsArtTokenIsX is ERC721, ERC721Enumerable, Pausable, Ownable {
    ////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////

    event Is(
        uint256 indexed tokenid,
        string token_is
    );

    ////////////////////////////////////////////////////////////////
    // Constants
    ////////////////////////////////////////////////////////////////

    uint256 public constant NUM_TOKENS = 16;

    // Allow empty definition values, catch invalid definitions in code
    uint constant DEF_MIN = 0x00;
    uint constant DEF_MAX = 0x21;

    string[DEF_MAX + 1] private ises = [
        "art",
        "non-art",
        "painting",
        "sculpture",
        "conceptual art",
        "architecture",
        "installation art",
        "body art",
        "performance art",

        "performance",
        "theatre",
        "music",
        "dance",
        "cinema",
        "opera",
        "television",

        "drama",
        "literature",
        "poetry",
        "prose",
        "fiction",

        "video art",
        "new media art",
        "a video game",
        "generative art",
        "net art",
        "digital art",
        "photography",

        "techne",
        "aesthetic",
        "gesamtkunstwerk",
        "critique",

        "nft art"
    ];

    ////////////////////////////////////////////////////////////////
    // Member variables
    ////////////////////////////////////////////////////////////////

    // Initial metadata URI.
    string private baseUri = "ipfs://bafybeiglmvres2ac2nyxvsxcxl57ohaxrlkgyils3c2rz2ljtwtmv3xc6m/IsArtTokenIsX";

    string[NUM_TOKENS] private is_ises;

    ////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////

    constructor() ERC721("Is Art (Token, Is X)", "ISATISX") {
        for (uint256 i = 0; i < NUM_TOKENS; i++) {
            uint256 tokenId = i + 1;
            is_ises[i] = ises[i];
            // Set internal state before interacting with other contracts
            _mint(msg.sender, tokenId);
            emit Is(tokenId, is_ises[i]);
        }
    }

    ////////////////////////////////////////////////////////////////
    // Public API
    ////////////////////////////////////////////////////////////////

    function tokenIs(uint256 tokenId)
        external
        view
        returns (string memory)
    {
        require(tokenId > 0 && tokenId <= NUM_TOKENS, "no such token");
        return is_ises[tokenId - 1];
    }

    function setIs(
        uint256 tokenId,
        uint8 newIs
    )
        public
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can set definition"
        );
        require(
            (newIs >= DEF_MIN) && (newIs <= DEF_MAX),
            "Invalid is value"
        );
        is_ises[tokenId - 1] = ises[newIs];
        emit Is(
            tokenId,
            is_ises[tokenId - 1]
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
