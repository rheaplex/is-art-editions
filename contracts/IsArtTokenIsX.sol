// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2017  Rhea Myers
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A contract where each token is set to be/not be art because X
// using the 'Art Is' controlled grammar by the token owner.

contract IsArtTokenIsX is ERC721, ERC721Enumerable, Pausable, Ownable {
    ////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////

    event DefinitionChanged(
        address indexed theorist,
        uint256 indexed tokenid,
        uint8 extent,
        uint8 connection,
        uint8 relation,
        uint8 subject
    );

    ////////////////////////////////////////////////////////////////
    // Structs
    ////////////////////////////////////////////////////////////////

    struct Definition {
        address theorist;
        uint8 extent;
        uint8 connection;
        uint8 relation;
        uint8 subject;
    }

    ////////////////////////////////////////////////////////////////
    // Constants
    ////////////////////////////////////////////////////////////////

    uint256 public constant NUM_TOKENS = 16;

    // Allow empty definition values, catch invalid definitions in code
    uint constant DEF_MIN = 0x00;
    uint constant DEF_MAX = 0x0F;

    string[DEF_MAX + 1] private extents = [
        "it is",
        "it competently critiques",
        "it expresses",
        "it interrogates",
        "it ironises",
        "it is zanily",
        "it is interestingly",
        "it is cutely",
        "it is paradoxically",
        "it concerns",
        "it represents",
        "its aesthetic value lies in",
        "it skilfully alludes to",
        "it passionately evokes",
        "it deftly realises",
        "no other artwork is as"
    ];

    string[DEF_MAX + 1] private connections = [
        "not",
        "universally",
        "ontologically",
        "epistemologically",
        "logically",
        "psychologically",
        "childishly",
        "sophisticatedly",
        "conservatively",
        "liberally",
        "ironically",
        "creepily",
        "radically",
        "queerly",
        "problematically",
        "neoliberally"
    ];

    string[DEF_MAX + 1] private relations = [
        "engaging with",
        "reliant on",
        "derivative of",
        "determined by",
        "defined by",
        "embracing of",
        "reacting to",
        "commenting on",
        "embracing",
        "resolving",
        "transcending",
        "valenced by",
        "critiquing",
        "attacking",
        "destroying",
        "obviating"
    ];

    string[DEF_MAX + 1] private subjects = [
        "specificity",
        "techne",
        "society",
        "politics",
        "materiality",
        "identity",
        "emotion",
        "critique",
        "aesthetics",
        "god",
        "satan",
        "beauty",
        "horror",
        "desire",
        "critique",
        "universality"
    ];

    ////////////////////////////////////////////////////////////////
    // Member variables
    ////////////////////////////////////////////////////////////////

    // Initial metadata URI.
    string private baseUri = "ipfs://QQQQQQQQQQQQQQQQQQQQQQQQQQQQ";

    Definition[NUM_TOKENS] private definitions;

    ////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////

    constructor() ERC721("Is Art (Token Is X)", "ISATIX") {
        for (uint256 i = 0; i < NUM_TOKENS; i++) {
            uint256 tokenId = i + 1;
            uint8 i8 = uint8(i);
            definitions[i] = Definition(address(0x0), i8, i8, i8, i8);
            // Set internal state before interacting with other contracts
            _mint(msg.sender, tokenId);
            emit DefinitionChanged(address(0x0), tokenId, i8, i8, i8, i8);
        }
    }

    ////////////////////////////////////////////////////////////////
    // Public API
    ////////////////////////////////////////////////////////////////

    function getDefinitionText(uint256 tokenId)
        external
        view
        returns (string memory)
    {
        require(tokenId > 0 && tokenId <= NUM_TOKENS, "no such token");
        Definition storage def = definitions[tokenId - 1];
        return string.concat(
            "this token is art because ",
            string(extents[def.extent]),
            " ",
            connections[def.connection],
            " ",
            relations[def.relation],
            " ",
            subjects[def.subject]
        );
    }

    function getDefinitionData(uint256 tokenId)
        external
        view
        returns (Definition memory)
    {
        require(tokenId > 0 && tokenId <= NUM_TOKENS, "no such token");
        return definitions[tokenId - 1];
    }

    function setDefinition(
        uint256 tokenId,
        uint8 extent,
        uint8 connection,
        uint8 relation,
        uint8 subject
    )
        public
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can toggle state"
        );
        uint256 index = tokenId - 1;
        require(
            isDefValid(extent, connection, relation, subject),
            "Invalid definition property"
        );
        address theorist = msg.sender;
        definitions[index].theorist = theorist;
        definitions[index].extent = extent;
        definitions[index].connection = connection;
        definitions[index].relation = relation;
        definitions[index].subject = subject;
        emit DefinitionChanged(
            theorist,
            tokenId,
            extent,
            connection,
            relation,
            subject
        );
    }

    ////////////////////////////////////////////////////////////////
    // Internal functions
    ////////////////////////////////////////////////////////////////

    function isDefValid (
        uint8 extent,
        uint8 connection,
        uint8 relation,
        uint8 subject
    )
        public
        pure
        returns (bool result)
    {
        result = isDefValueInRange(extent) &&
            isDefValueInRange(connection) &&
            isDefValueInRange(relation) &&
            isDefValueInRange(subject);
    }

    function isDefValueInRange (uint8 defValue)
        public
        pure
        returns (bool result)
    {
        result = (defValue >= DEF_MIN) &&
            (defValue <= DEF_MAX);
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
