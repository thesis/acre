// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Dispatcher.sol";

/// @title Acre
/// @notice This contract implements the ERC-4626 tokenized vault standard. By
///         staking tBTC, users acquire a liquid staking token called stBTC,
///         commonly referred to as "shares". The staked tBTC is securely
///         deposited into Acre's vaults, where it generates yield over time.
///         Users have the flexibility to redeem stBTC, enabling them to
///         withdraw their staked tBTC along with the accrued yield.
/// @dev ERC-4626 is a standard to optimize and unify the technical parameters
///      of yield-bearing vaults. This contract facilitates the minting and
///      burning of shares (stBTC), which are represented as standard ERC20
///      tokens, providing a seamless exchange with tBTC tokens.
contract Acre is ERC4626 {
    using SafeERC20 for IERC20;

    Dispatcher public dispatcher;

    error ZeroAddress();

    event StakeReferral(bytes32 indexed referral, uint256 assets);

    constructor(
        IERC20 tbtc
    ) ERC4626(tbtc) ERC20("Acre Staked Bitcoin", "stBTC") {}

    /// @notice Stakes a given amount of tBTC token and mints shares to a
    ///         receiver.
    /// @dev This function calls `deposit` function from `ERC4626` contract. The
    ///      amount of the assets has to be pre-approved in the tBTC contract.
    /// @param assets Approved amount for the transfer and stake.
    /// @param receiver The address to which the shares will be minted.
    /// @param referral Data used for referral program.
    /// @return shares Minted shares.
    function stake(
        uint256 assets,
        address receiver,
        bytes32 referral
    ) public returns (uint256) {
        // TODO: revisit the type of referral.
        uint256 shares = deposit(assets, receiver);

        if (referral != bytes32(0)) {
            emit StakeReferral(referral, assets);
        }

        return shares;
    }

    // TODO: add onlyOwner
    function updateDispatcher(Dispatcher _dispatcher) external {
        if (address(_dispatcher) == address(0)) {
            revert ZeroAddress();
        }
        dispatcher = _dispatcher;
    }

    // TODO: Add maintainerOnly or maintainerOrOwner?
    // We should decide if this function should be called by a bot (maintainer)
    // only. Leaving as is for now for testing purposes.
    function depositToVault(
        address vault,
        uint256 amount,
        uint256 minSharesOut
    ) external {
        IERC20(asset()).safeIncreaseAllowance(address(dispatcher), amount);
        // TODO: check if the dispatcher is set
        dispatcher.depositToVault(vault, amount, minSharesOut);
    }

    // TODO: same question as for depositToVault
    function redeemFromVault(
        address vault,
        uint256 shares,
        uint256 minAssetsOut
    ) external {
        // TODO: implement
        dispatcher.redeemFromVault(vault, shares, minAssetsOut);
    }
}
