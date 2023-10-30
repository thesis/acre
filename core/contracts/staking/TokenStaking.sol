// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

/// @title TokenStaking
/// @notice A token staking contract for a specified standard ERC20 token. A
///         holder of the specified token can stake its tokens to this contract
///         and recover the stake after undelegation period is over.
contract TokenStaking {
    // TODO: use IERC20 contract as type
    address internal immutable token;

    constructor(address _token) {
        require(
            address(_token) != address(0),
            "Token can not be the zero address"
        );

        token = _token;
    }
}
