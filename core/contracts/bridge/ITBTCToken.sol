// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

/// @title Interface of TBTC token contract.
/// @notice This interface defines functions of TBTC token contract used by Acre
///         contracts.
interface ITBTCToken {
    /// @notice Calls `receiveApproval` function on spender previously approving
    ///         the spender to withdraw from the caller multiple times, up to
    ///         the `amount` amount. If this function is called again, it
    ///         overwrites the current allowance with `amount`. Reverts if the
    ///         approval reverted or if `receiveApproval` call on the spender
    ///         reverted.
    /// @return True if both approval and `receiveApproval` calls succeeded.
    /// @dev If the `amount` is set to `type(uint256).max` then
    ///      `transferFrom` and `burnFrom` will not reduce an allowance.
    function approveAndCall(
        address spender,
        uint256 amount,
        bytes memory extraData
    ) external returns (bool);

    /// @dev Returns the address of the contract owner.
    function owner() external view returns (address);
}
