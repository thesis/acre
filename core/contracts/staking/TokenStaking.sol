// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title TokenStaking
/// @notice A token staking contract for a specified standard ERC20 token. A
///         holder of the specified token can stake its tokens to this contract
///         and recover the stake after undelegation period is over.
contract TokenStaking {
    using SafeERC20 for IERC20;
    
    IERC20 internal immutable token;

    constructor(IERC20 _token) {
        require(
            address(_token) != address(0),
            "Token can not be the zero address"
        );

        token = _token;
    }
}
