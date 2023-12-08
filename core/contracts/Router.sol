// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";

/// TODO: Add documentation
abstract contract Router {
    using SafeERC20 for IERC20;

    /// @notice Routes funds from stBTC (Acre) to a vault. The amount of tBTC to
    ///         Shares of deposited tBTC are minted to the stBTC contract.
    /// @param vault Address of the vault to route the funds to.
    /// @param to Address of the receiver of the shares.
    /// @param amount Amount of tBTC to deposit.
    /// @param minSharesOut Minimum amount of shares to receive.
    function deposit(
        IERC4626 vault,
        address to,
        uint256 amount,
        uint256 minSharesOut
    ) public returns (uint256 sharesOut) {
        IERC20(vault.asset()).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        IERC20(vault.asset()).safeIncreaseAllowance(address(vault), amount);
        if ((sharesOut = vault.deposit(amount, to)) < minSharesOut) {
            revert("Not enough shares received");
        }
    }

    /// @notice Redeem tBTC from a vault and approve tokens to be transferred
    ///         by stBTC (Acre)
    /// @param vault Address of the vault to collect the assets from.
    /// @param to Address of the receiver of the assets.
    /// @param shares Amount of shares to collect. Shares are the internal representation
    ///               of the underlying asset in the vault. Concrete amount of the
    ///               underlying asset is calculated by calling `convertToAssets` on
    ///               the vault and the shares are burned.
    /// @param minAssetsOut Minimum amount of TBTC to receive.
    function redeem(
        IERC4626 vault,
        address to,
        uint256 shares,
        uint256 minAssetsOut
    ) public returns (uint256 assetsOut) {
        if (
            (assetsOut = vault.redeem(shares, address(this), to)) < minAssetsOut
        ) {
            revert("Not enough assets received");
        }
        IERC20(vault.asset()).safeIncreaseAllowance(to, assetsOut);
    }
}
