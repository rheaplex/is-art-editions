// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// A token issuance which is/is not art based on the votes of its token owners.

contract IsArtTokenDemocratic is ERC721, ERC721Enumerable, Pausable, Ownable {
    ////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////

    event Toggled(
        uint256 tokenId,
        bool isState,
        uint8 isCount,
        uint8 isPercentage,
        bool isContractArt
    );

    ////////////////////////////////////////////////////////////////
    // Constants
    ////////////////////////////////////////////////////////////////

    uint256 private constant NUM_TOKENS = 16;
    uint8 private constant THRESHOLD = 8;
    uint256 private constant PERCENTAGE = 10000 / NUM_TOKENS;

    ////////////////////////////////////////////////////////////////
    // Member variables
    ////////////////////////////////////////////////////////////////

    // Initial metadata URI.
    string private baseUri = "ipfs://QQQQQQQQQQQQQQQQQQQQQQQQQQQQ";

    uint8 private isCount = 0;
    bool[NUM_TOKENS] private ises;

    ////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////

    constructor() ERC721("Is Art (Token, Democratic)", "ISATD") {
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            _mint(msg.sender, i);
        }
    }

    ////////////////////////////////////////////////////////////////
    // Public API
    ////////////////////////////////////////////////////////////////

    function threshold() external pure returns (uint8) {
        return THRESHOLD;
    }

    function toggle(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only token holder can toggle state"
        );
        bool newState = ! ises[tokenId - 1];
        ises[tokenId - 1] = newState;
        if (newState) {
            isCount += 1;
        } else {
            isCount -= 1;
        }
        emit Toggled(
            tokenId,
            newState,
            isCount,
            tokenIsArtPercentage(),
            tokenIsArt()
        );
    }

    function tokenIdIsArt (uint256 tokenId) external view returns (bool) {
        require(
            tokenId > 0 && tokenId <= NUM_TOKENS,
            "No token with that tokenId exists"
        );
        return ises[tokenId - 1];
    }

    function tokenIsArtPercentage () public view returns (uint8) {
        return uint8((uint256(isCount) * PERCENTAGE) / 100);
    }

    function tokenIsArt () public view returns (bool) {
        return isCount >= THRESHOLD;
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
