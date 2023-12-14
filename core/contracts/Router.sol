// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// TODO: Consider deploying ERC4626RouterBase from the ERC4626 Alliance.
// TODO: Think about adding reentrancy guard
// TODO: Add ACL
abstract contract Router {
    using SafeERC20 for IERC20;

    /// @notice thrown when amount of assets received is below the min set by caller
    error MinAmountError();

    /// @notice thrown when amount of shares received is below the min set by caller
    error MinSharesError();

    /// @notice thrown when amount of assets received is above the max set by caller
    error MaxAmountError();

    /// @notice thrown when amount of shares received is above the max set by caller
    error MaxSharesError();

    // Copied from ERC4626RouterBase
    // Differences:
    // - internal instead of public
    function deposit(
        IERC4626 vault,
        address to,
        uint256 amount,
        uint256 minSharesOut
    ) internal virtual returns (uint256 sharesOut) {
        if ((sharesOut = vault.deposit(amount, to)) < minSharesOut) {
            revert MinSharesError();
        }
    }

    // Copied from ERC4626RouterBase
    // Difference:
    // - internal instead of public
    // - use address(this) as owner instead of msg.sender
    function withdraw(
        IERC4626 vault,
        address to,
        uint256 amount,
        uint256 maxSharesOut
    ) internal virtual returns (uint256 sharesOut) {
        if (
            (sharesOut = vault.withdraw(amount, to, address(this))) >
            maxSharesOut
        ) {
            revert MaxSharesError();
        }
    }

    // Copied from ERC4626RouterBase
    // Difference:
    // - internal instead of public
    // - use address(this) as owner instead of msg.sender
    function redeem(
        IERC4626 vault,
        address to,
        uint256 shares,
        uint256 minAmountOut
    ) internal virtual returns (uint256 amountOut) {
        if (
            (amountOut = vault.redeem(shares, to, address(this))) < minAmountOut
        ) {
            revert MinAmountError();
        }
    }
}
