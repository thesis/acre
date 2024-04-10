// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

/// @title IDispatcher
/// @notice Interface for the Dispatcher contract.
interface IDispatcher {
    /// @notice Withdraw assets from the Dispatcher.
    function withdraw(uint256 amount) external;

    /// @notice Returns the total amount of assets held by the Dispatcher.
    function totalAssets() external view returns (uint256);
}
