// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import {ZeroAddress} from "./utils/Errors.sol";

/// @title AbstractPausable
/// @notice This abstract contract extracts a common part of the emergency stop
///         mechanism. The emergency stop mechanism can be triggered by an
///         authorized account. Only owner of the contract can update the
///         emergency stop account.
/// @dev The child contract must override the `_checkOwner` internal function.
abstract contract AbstractPausable is PausableUpgradeable {
    /// @notice An authorized account that can trigger emergency stop mechanism.
    address private _pauseAdmin;

    /// @notice Emitted when a emergency account is updated.
    /// @param newAccount New emergency stop wallet address.
    /// @param oldAccount Old emergency stop wallet address.
    event PauseAdminUpdated(address newAccount, address oldAccount);

    /// @notice Reverts when an unauthorized account triggers the emergency stop
    ///         mechanism.
    error NotPauseAdmin(address account);

    /// @notice Reverts if called by any account other than the pause admin
    ///         account.
    modifier onlyPauseAdmin() {
        if (_msgSender() != _pauseAdmin) {
            revert NotPauseAdmin(_msgSender());
        }
        _;
    }

    /// @notice Enables an emergency stop mechanism.
    /// @dev Requirements:
    ///      - The caller must be an authorized account to trigger pause.
    ///      - The contract must not be already paused.
    function pause() external onlyPauseAdmin {
        _pause();
    }

    /// @notice Turns off the emergency stop mechanism.
    /// @dev Requirements:
    ///      - The caller must be an authorized account to trigger unpause.
    ///      - The contract must be paused.
    function unpause() external onlyPauseAdmin {
        _unpause();
    }

    /// @notice Updates an authorized account that can trigger emergency stop
    ///         mechanism.
    /// @dev Throws if called by any account other than the owner.
    /// @param newpauseAdmin New account that can trigger emergency
    ///        stop mechanism.
    function updatePauseAdmin(address newpauseAdmin) external {
        _checkOwner();
        // TODO: Introduce a parameters update process.
        if (newpauseAdmin == address(0)) {
            revert ZeroAddress();
        }

        emit PauseAdminUpdated(newpauseAdmin, _pauseAdmin);

        _pauseAdmin = newpauseAdmin;
    }

    /// @notice Initializes the contract. MUST BE CALLED from the child
    ///         contract initializer.
    /// @param initialpauseAdmin Initial emergency stop account that
    ///        can trigger the emergency stop mechanism.
    // solhint-disable-next-line func-name-mixedcase
    function __AbstractPausable_init(
        address initialpauseAdmin
    ) internal onlyInitializing {
        __Pausable_init();
        __AbstractPausable_init_unchained(initialpauseAdmin);
    }

    // solhint-disable-next-line func-name-mixedcase
    function __AbstractPausable_init_unchained(
        address initialpauseAdmin
    ) internal onlyInitializing {
        _pauseAdmin = initialpauseAdmin;
    }

    /// @notice Checks if the caller is an owner of contract.
    /// @dev Must be overridden by a child contract and throws an error if the
    ///      sender is not the owner.
    function _checkOwner() internal view virtual {}
}
