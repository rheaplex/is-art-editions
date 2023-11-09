// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.17;

interface IIsArt {

    function is_art () external view returns (bytes6);

    function toggle () external;

}
