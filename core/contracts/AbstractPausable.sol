// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import {ZeroAddress} from "./utils/Errors.sol";

/// @title AbstractPausable
/// @notice This abstract contract extracts a common part of the emergency stop
///         mechanism. The emergency stop mechanism can be triggered by an
///         authorized account. Only owner of the contract can update the
///         emergency stop account.
/// @dev The child contract must override the `owner` function.
abstract contract AbstractPausable is PausableUpgradeable {
    /// @notice An authorized account that can trigger emergency stop mechanism.
    address public pauseAdmin;

    /// @notice Emitted when a emergency account is updated.
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
    /// @param initialPauseAdmin Initial emergency stop account that
    ///        can trigger the emergency stop mechanism.
    // solhint-disable-next-line func-name-mixedcase
    function __AbstractPausable_init(
        address initialPauseAdmin
    ) internal onlyInitializing {
        __Pausable_init();
        __AbstractPausable_init_unchained(initialPauseAdmin);
    }

    // solhint-disable-next-line func-name-mixedcase
    function __AbstractPausable_init_unchained(
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
    function updatePauseAdmin(address newPauseAdmin) external {
        address msgSender = _msgSender();
        if (owner() != msgSender) {
            revert PausableUnauthorizedAccount(msgSender);
        }

        // TODO: Introduce a parameters update process.
        if (newPauseAdmin == address(0)) {
            revert ZeroAddress();
        }

        emit PauseAdminUpdated(newPauseAdmin, pauseAdmin);

        pauseAdmin = newPauseAdmin;
    }

    /// @notice Returns the address of the current owner.
    /// @dev Must be overridden by a child contract.
    function owner() public view virtual returns (address);
}
