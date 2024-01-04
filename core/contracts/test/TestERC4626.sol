// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract TestERC4626 is ERC4626 {
    constructor(
        IERC20 asset,
        string memory tokenName,
        string memory tokenSymbol
    ) ERC4626(asset) ERC20(tokenName, tokenSymbol) {}
}
