// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

import {ZeroAddress} from "./utils/Errors.sol";

/// @title PausableOwnable
/// @notice This abstract contract extracts a common part of the emergency stop
///         mechanism. The emergency stop mechanism can be triggered by an
///         authorized account. Only owner of the contract can update pause
///         admin address.
abstract contract PausableOwnable is
    PausableUpgradeable,
    Ownable2StepUpgradeable
{
    /// @notice An authorized account that can trigger emergency stop mechanism.
    address public pauseAdmin;

    // Reserved storage space that allows adding more variables without affecting
    // the storage layout of the child contracts. The convention from OpenZeppelin
    // suggests the storage space should add up to 50 slots. If more variables are
    // added in the upcoming versions one need to reduce the array size accordingly.
    // See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
    // slither-disable-next-line unused-state
    uint256[49] private __gap;

    /// @notice Emitted when a pause admin address is updated.
    /// @param newAccount New pause admin address.
    /// @param oldAccount Old pause admin address.
    event PauseAdminUpdated(address newAccount, address oldAccount);

    /// @notice Reverts when an unauthorized account triggers the emergency stop
    ///         mechanism.
    error PausableUnauthorizedAccount(address account);

    /// @notice Reverts if called by any account other than the pause admin
    ///         or the contract owner.
    modifier onlyPauseAdminOrOwner() {
        address msgSender = _msgSender();

        if (pauseAdmin != msgSender && owner() != msgSender) {
            revert PausableUnauthorizedAccount(msgSender);
        }
        _;
    }

    /// @notice Initializes the contract. MUST BE CALLED from the child
    ///         contract initializer.
    /// @param initialOwner Initial owner of the contract.
    /// @param initialPauseAdmin Initial emergency stop account that can trigger
    ///        the emergency stop mechanism.
    // solhint-disable-next-line func-name-mixedcase
    function __PausableOwnable_init(
        address initialOwner,
        address initialPauseAdmin
    ) internal onlyInitializing {
        __Pausable_init();
        __Ownable2Step_init();
        __Ownable_init(initialOwner);
        __PausableOwnable_init_unchained(initialPauseAdmin);
    }

    // solhint-disable-next-line func-name-mixedcase
    function __PausableOwnable_init_unchained(
        address initialPauseAdmin
    ) internal onlyInitializing {
        pauseAdmin = initialPauseAdmin;
    }

    /// @notice Enables an emergency stop mechanism.
    /// @dev Requirements:
    ///      - The caller must be an authorized account to trigger pause.
    ///      - The contract must not be already paused.
    // solhint-disable-next-line ordering
    function pause() external onlyPauseAdminOrOwner {
        _pause();
    }

    /// @notice Turns off the emergency stop mechanism.
    /// @dev Requirements:
    ///      - The caller must be an authorized account to trigger unpause.
    ///      - The contract must be paused.
    function unpause() external onlyPauseAdminOrOwner {
        _unpause();
    }

    /// @notice Updates an authorized account that can trigger emergency stop
    ///         mechanism.
    /// @dev Throws if called by any account other than the owner.
    /// @param newPauseAdmin New account that can trigger emergency
    ///        stop mechanism.
    function updatePauseAdmin(address newPauseAdmin) external onlyOwner {
        if (newPauseAdmin == address(0)) {
            revert ZeroAddress();
        }

        emit PauseAdminUpdated(newPauseAdmin, pauseAdmin);

        pauseAdmin = newPauseAdmin;
    }
}
