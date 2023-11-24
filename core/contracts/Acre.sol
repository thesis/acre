// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract Acre is ERC4626 {
    constructor(IERC20 _token) ERC4626(_token) ERC20("Staking BTC", "stBTC") {}

    /// @notice Stakes a given amount of underlying token and mints shares to a
    ///         receiver.
    /// @dev This function calls `deposit` function from `ERC4626` contract.
    /// @param assets Approved amount for the transfer and stake.
    /// @param receiver The address to which the shares will be minted.
    /// @param referrer Data used for refferal program.
    /// @return shares Minted shares.
    function stake(
        uint256 assets,
        address receiver,
        bytes32 referrer
    ) external returns (uint256 shares) {
        require(referrer != bytes32(0), "Referrer can not be empty");

        return super.deposit(assets, receiver);
    }
}
