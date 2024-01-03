// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";

/// @title Router
/// @notice Router is a contract that routes tBTC from stBTC (Acre) to
///         a given vault and back. Vaults supply yield strategies with tBTC that
///         generate yield for Bitcoin holders.
abstract contract Router {
    using SafeERC20 for IERC20;

    /// Thrown when amount of shares received is below the min set by caller.
    /// @param vault Address of the vault.
    /// @param sharesOut Amount of shares received by Acre.
    /// @param minSharesOut Minimum amount of shares expected to receive.
    error MinSharesError(
        address vault,
        uint256 sharesOut,
        uint256 minSharesOut
    );

    /// @notice Routes funds from stBTC (Acre) to a vault. The amount of tBTC to
    ///         Shares of deposited tBTC are minted to the stBTC contract.
    /// @param vault Address of the vault to route the funds to.
    /// @param receiver Address of the receiver of the shares.
    /// @param amount Amount of tBTC to deposit.
    /// @param minSharesOut Minimum amount of shares to receive.
    function deposit(
        IERC4626 vault,
        address receiver,
        uint256 amount,
        uint256 minSharesOut
    ) internal returns (uint256 sharesOut) {
        if ((sharesOut = vault.deposit(amount, receiver)) < minSharesOut) {
            revert MinSharesError(address(vault), sharesOut, minSharesOut);
        }
    }
}
