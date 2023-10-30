// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Test Token", "TEST") {}

    function mint(address account, uint256 value) external {
        _mint(account, value);
    }
}
