// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../stBTC.sol";

contract stBTCStub is stBTC {
    using SafeERC20 for IERC20;

    function workaround_transfer(address to, uint256 amount) external {
        IERC20(asset()).safeTransfer(to, amount);
    }
}
