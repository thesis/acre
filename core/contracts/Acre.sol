// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

/// @title Acre
/// @notice Implementation of the ERR-4626 tokenized vault standard. ERC-4626 is
///         a standard to optimize and unify the technical parameters of
///         yield-bearing vaults. This contract allows the minting and burning
///         of shares, represented as standard ERC20 token, in exchange for tBTC
///         tokens.
/// @dev ERC-4626 standard extends the ERC-20 token.
contract Acre is ERC4626 {
    event StakeReferral(bytes32 indexed referral, uint256 assets);

    constructor(
        IERC20 tbtc
    ) ERC4626(tbtc) ERC20("Acre Staked Bitcoin", "stBTC") {}

    /// @notice Stakes a given amount of tBTC token and mints shares to a
    ///         receiver.
    /// @dev This function calls `deposit` function from `ERC4626` contract.
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

        emit StakeReferral(referral, assets);

        return shares;
    }
}
