// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC4626Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @title ERC4626 Non-Fungible Withdrawals
/// @notice This contract introduces non-fungible withdrawals feature to the ERC4626
///         Vault. When enabled, the receiver/owner can withdraw a limited amount
///         of the underlying asset from the Vault, based on the shares that were
///         minted for the receiver/owner with the deposit. The feature is enabled
///         automatically on contract initialization and can be disabled by the
///         governance. Once disabled, the feature cannot be re-enabled.
abstract contract ERC4626NonFungibleWithdrawals is ERC4626Upgradeable {
    /// @notice Indicates whether the non-fungible withdrawals are enabled.
    bool public nonFungibleWithdrawalsEnabled;

    /// @notice The amount of shares that were minted for the receiver with the
    ///         deposit.
    mapping(address => uint256) public withdrawableShares;

    // Reserved storage space that allows adding more variables without affecting
    // the storage layout of the child contracts. The convention from OpenZeppelin
    // suggests the storage space should add up to 50 slots. If more variables are
    // added in the upcoming versions one need to reduce the array size accordingly.
    // See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
    // slither-disable-next-line unused-state
    uint256[49] private __gap;

    /// @notice Emitted when the non-fungible withdrawals are disabled.
    event NonFungibleWithdrawalsDisabled();

    /// @notice Emitted when the non-fungible withdrawals are already disabled.
    error NonFungibleWithdrawalsAlreadyDisabled();

    /// @dev Initializes the contract by setting the non-fungible withdrawals to
    ///      enabled.
    function __ERC4626NonFungibleWithdrawals_init() internal onlyInitializing {
        nonFungibleWithdrawalsEnabled = true;
    }

    /// @dev Returns the maximum amount of the underlying asset that can be
    ///      withdrawn from the owner balance in the Vault, through a withdraw call.
    ///      If non-fungible withdrawals are enabled, the maximum amount is limited
    ///      by the shares that was minted for the owner with the deposit.
    function maxWithdraw(
        address owner
    ) public view virtual override returns (uint256) {
        uint256 maxWithdrawable = super.maxWithdraw(owner);

        if (nonFungibleWithdrawalsEnabled) {
            return
                Math.min(
                    maxWithdrawable,
                    convertToAssets(withdrawableShares[owner])
                );
        }

        return maxWithdrawable;
    }

    /// @dev Returns the maximum amount of Vault shares that can be redeemed from
    ///      the owner balance in the Vault, through a redeem call.
    ///      If non-fungible withdrawals are enabled, the maximum amount is limited
    ///      by the shares that was minted for the owner with the deposit.
    function maxRedeem(
        address owner
    ) public view virtual override returns (uint256) {
        uint256 maxRedeemable = super.maxRedeem(owner);

        if (nonFungibleWithdrawalsEnabled) {
            return Math.min(maxRedeemable, withdrawableShares[owner]);
        }

        return maxRedeemable;
    }

    /// @notice Disables the non-fungible withdrawals. Once disabled, the feature
    ///         cannot be re-enabled.
    /// @dev This function should be callable only by the owner.
    function _disableNonFungibleWithdrawals() internal {
        if (nonFungibleWithdrawalsEnabled == false) {
            revert NonFungibleWithdrawalsAlreadyDisabled();
        }

        nonFungibleWithdrawalsEnabled = false;

        emit NonFungibleWithdrawalsDisabled();
    }

    /// @dev Overrides the {IERC4626-_deposit} function to track the shares that
    ///      were minted for the receiver with the deposit.
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        if (nonFungibleWithdrawalsEnabled) {
            withdrawableShares[receiver] += shares;
        }

        super._deposit(caller, receiver, assets, shares);
    }

    /// @dev Overrides the {IERC4626-_withdraw} function to track the shares that
    ///      were burned for the owner with the withdraw.
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        if (nonFungibleWithdrawalsEnabled) {
            withdrawableShares[owner] -= shares;
        }

        super._withdraw(caller, receiver, owner, assets, shares);
    }
}
