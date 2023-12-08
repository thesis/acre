// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Acre.sol";


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


    function assetsHolder() public virtual returns (address);
    function sharesHolder() public virtual returns (address);

    function deposit(
        IERC4626 vault,
        uint256 amount,
        uint256 minSharesOut
    ) public returns (uint256 sharesOut) {
        IERC20(vault.asset()).safeTransferFrom(assetsHolder(), address(this), amount);

        IERC20(vault.asset()).approve(address(vault), amount);

        if ((sharesOut = vault.deposit(amount, sharesHolder())) < minSharesOut) {
            revert MinSharesError();
        }
    }


    function withdraw(
        IERC4626 vault,
        uint256 amount,
        uint256 maxSharesOut
    ) public returns (uint256 sharesOut) {
        if ((sharesOut = vault.withdraw(amount, assetsHolder(), sharesHolder())) > maxSharesOut) {
            revert MaxSharesError();
        }
    }

    function redeem(
        IERC4626 vault,
        uint256 shares,
        uint256 minAmountOut
    ) public returns (uint256 amountOut) {
        if ((amountOut = vault.redeem(shares, assetsHolder(), sharesHolder())) < minAmountOut) {
            revert MinAmountError();
        }
    }
}
