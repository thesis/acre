// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../bridge/ITBTCToken.sol";

contract TestTBTC is ITBTCToken, ERC20 {
    event ApproveAndCallCalled(
        address spender,
        uint256 amount,
        bytes extraData
    );

    bool public approveAndCallResult = true;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address account, uint256 value) external {
        _mint(account, value);
    }

    function setApproveAndCallResult(bool result) external {
        approveAndCallResult = result;
    }

    function approveAndCall(
        address spender,
        uint256 amount,
        bytes memory extraData
    ) external returns (bool) {
        emit ApproveAndCallCalled(spender, amount, extraData);

        return approveAndCallResult;
    }

    function owner() external pure returns (address) {
        return 0xABcDefD75a220Ba350DDf6B1A5ec2a1b77BA8AF5;
    }
}
