// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.17;

interface IDemocraticPalette {

    struct Colour {
        uint8 red;
        uint8 green;
        uint8 blue;
        uint votes;
    }

    // Store the most voted-for colours as the palette
    function palette (uint256 index) external returns (Colour memory);

}
