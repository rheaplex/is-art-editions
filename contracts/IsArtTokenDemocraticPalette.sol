// SPDX-License-Identifier: GPL-3.0-or-later
// Author:                  Rhea Myers <rhea@myers.studio>
// Copyright:               2023 Myers Studio, Ltd.
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IDemocraticPalette.sol";

// A contract where each token is/is not art based on the vote of its owner,
// with rendered text colours taken from "Democratic Palette".

contract IsArtTokenDemocraticPalette
is ERC721, ERC721Enumerable, Pausable, Ownable
{
    uint256 public constant NUM_TOKENS = 16;

    address private paletteContract;

    event Status(uint256 indexed tokenId, bytes6 is_art);

    // Initial metadata URI.
    string private baseUri = "ipfs://bafybeiguj5bmzs4zd4w7s5pwqmbmuxgkhv77t3d3xw4xwwe4hys5c5aot4/IsArtTokenDemocraticPalette/";

    bytes6[NUM_TOKENS] private is_art;

    constructor(address palette) ERC721(
        "Is Art (Token, Democratic Palette)",
        "ISATDP"
    ) {
        paletteContract = palette;
        for (uint256 i = 1; i <= NUM_TOKENS; i++) {
            // Set internal state before interacting with other conacts
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
        if (is_art[index] == "is") {
            is_art[index] = "is not";
        } else {
            is_art[index] = "is";
        }
        emit Status(tokenId, is_art[index]);
    }

    function tokenIsArt (uint256 tokenId)
        external
        returns (string memory)
    {
        _requireMinted(tokenId);
        IDemocraticPalette palette = IDemocraticPalette(paletteContract);
        return string.concat(
            "<div style=\"background-color: #",
            cssColour(palette.palette(colourIndexWrap(tokenId, 0))),
            ";\">",
            colouredText(tokenId, 1, "this"),
            colouredText(tokenId, 2, "token"),
            colouredText(
                tokenId,
                3,
                is_art[tokenId - 1] == bytes6("is") ? "is" : "is not"
            ),
            colouredText(tokenId, 4, "art"),
            "</div>"
        );
    }

    function colouredText(
        uint256 tokenId,
        uint256 colourIndex,
        string memory toColour
    )
        private
        returns (string memory)
    {
        IDemocraticPalette palette = IDemocraticPalette(paletteContract);
        return string.concat(
            "<span style=\"color: #",
            cssColour(palette.palette(colourIndexWrap(tokenId, colourIndex))),
            ";\">",
            toColour,
            "</span><br>"
        );
    }

    function cssColour (IDemocraticPalette.Colour memory col)
    private
    pure
    returns (
        string memory css
    ) {
        return string(
            abi.encodePacked(
                uint8ToHex(col.red),
                uint8ToHex(col.green),
                uint8ToHex(col.blue)
            )
        );
    }

    function uint8ToHex (uint8 n) private pure returns (bytes2) {
        uint8[16] memory lookup = [
            // ascii 0-9 .
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
            // ascii A-F.
            65, 66, 67, 68, 69, 70
        ];
        return bytes2(
            (uint16(lookup[n / 16]) << 8) +
            uint16(lookup[n % 16])
        );
    }

    // We can only access the first 12 (0..11) colours, and we need more.

    function colourIndexWrap(uint256 tokenId, uint256 index)
        internal
        pure
        returns (uint8)
    {
        uint256 nn;
        if (tokenId < 8) {
            nn = (tokenId - 1) + index;
        } else {
            nn = (19 - tokenId) - index;
        }
        return uint8(nn);
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
