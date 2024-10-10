// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IMezoPortal} from "../MezoAllocator.sol";

contract MezoPortalStub is IMezoPortal {
    using SafeERC20 for IERC20;

    event WithdrawFully(address token, uint256 depositId);
    event WithdrawPartially(address token, uint256 depositId, uint96 amount);

    error DepositNotFound();

    uint256 public depositCount;

    mapping(address => mapping(address => mapping(uint256 => DepositInfo)))
        public deposits;

    function setDepositCount(uint256 _depositCount) external {
        depositCount = _depositCount;
    }

    function withdraw(address token, uint256 depositId) external {
        DepositInfo storage selectedDeposit = deposits[msg.sender][token][
            depositId
        ];

        uint256 depositBalance = selectedDeposit.balance;

        if (depositBalance == 0) {
            revert DepositNotFound();
        }

        delete deposits[msg.sender][token][depositId];

        emit WithdrawFully(token, depositId);

        IERC20(token).safeTransfer(msg.sender, depositBalance);
    }

    function withdrawPartially(
        address token,
        uint256 depositId,
        uint96 amount
    ) external {
        DepositInfo storage selectedDeposit = deposits[msg.sender][token][
            depositId
        ];

        if (selectedDeposit.balance == 0) {
            revert DepositNotFound();
        }

        selectedDeposit.balance -= amount;

        emit WithdrawPartially(token, depositId, amount);

        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function deposit(address token, uint96 amount, uint32 lockPeriod) external {
        uint256 depositId = ++depositCount;

        deposits[msg.sender][token][depositId].balance = amount;

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    function getDeposit(
        address depositor,
        address token,
        uint256 depositId
    ) external view returns (IMezoPortal.DepositInfo memory) {
        return deposits[depositor][token][depositId];
    }
}
