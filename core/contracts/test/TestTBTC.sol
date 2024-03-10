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

    function approveAndCall(
        address spender,
        uint256 amount,
        bytes memory extraData
    ) external returns (bool) {
        emit ApproveAndCallCalled(spender, amount, extraData);

        return approveAndCallResult;
    }

    function owner() external pure returns (address) {
        return address(1);
    }
}
