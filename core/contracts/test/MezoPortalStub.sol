// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MezoPortalStub {
    using SafeERC20 for IERC20;

    uint256 public depositCount;

    function withdraw(
        address token,
        uint256 depositId,
        uint96 amount
    ) external {}

    function deposit(address token, uint96 amount, uint32 lockPeriod) external {
        depositCount++;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }
}
