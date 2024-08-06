// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IMezoPortal} from "../MezoAllocator.sol";

contract MezoPortalStub is IMezoPortal {
    using SafeERC20 for IERC20;

    uint256 public depositCount;

    event WithdrawFully(address token, uint256 depositId);
    event WithdrawPartially(address token, uint256 depositId, uint96 amount);

    error DepositNotFound();

    function withdraw(address token, uint256 depositId) external {
        if (depositCount == 0) {
            revert DepositNotFound();
        }

        emit WithdrawFully(token, depositId);
        IERC20(token).safeTransfer(
            msg.sender,
            IERC20(token).balanceOf(address(this))
        );
    }

    function withdrawPartially(
        address token,
        uint256 depositId,
        uint96 amount
    ) external {
        if (depositCount == 0) {
            revert DepositNotFound();
        }

        emit WithdrawPartially(token, depositId, amount);
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function deposit(address token, uint96 amount, uint32 lockPeriod) external {
        depositCount++;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    function getDeposit(
        address depositor,
        address token,
        uint256 depositId
    ) external view returns (IMezoPortal.DepositInfo memory) {
        return
            IMezoPortal.DepositInfo({
                balance: uint96(IERC20(token).balanceOf(address(this))),
                unlockAt: uint32(block.timestamp),
                receiptMinted: uint96(0),
                feeOwed: uint96(0),
                lastFeeIntegral: uint88(0)
            });
    }
}
