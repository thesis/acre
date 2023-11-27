// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@thesis/solidity-contracts/contracts/token/IApproveAndCall.sol";
import "@thesis/solidity-contracts/contracts/token/IReceiveApproval.sol";

contract TestToken is ERC20, IApproveAndCall {
    constructor() ERC20("Test Token", "TEST") {}

    function mint(address account, uint256 value) external {
        _mint(account, value);
    }

    function approveAndCall(
        address spender,
        uint256 amount,
        bytes memory extraData
    ) external returns (bool) {
        if (approve(spender, amount)) {
            IReceiveApproval(spender).receiveApproval(
                msg.sender,
                amount,
                address(this),
                extraData
            );
            return true;
        }
        return false;
    }
}
