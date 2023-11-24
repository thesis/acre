// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract Acre is ERC4626 {
    constructor(IERC20 _token) ERC4626(_token) ERC20("Staking BTC", "stBTC") {}
}
