// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {AcreBitcoinDepositor} from "../AcreBitcoinDepositor.sol";

/// @dev A test contract to expose internal function from  AcreBitcoinDepositor contract.
///      This solution follows Foundry recommendation:
///      https://book.getfoundry.sh/tutorials/best-practices#internal-functions
contract AcreBitcoinDepositorHarness is AcreBitcoinDepositor {
    constructor(
        address bridge,
        address tbtcVault,
        address tbtcToken,
        address stbtc
    ) AcreBitcoinDepositor(bridge, tbtcVault, tbtcToken, stbtc) {}

    function exposed_finalizeBridging(
        uint256 depositKey
    ) external returns (uint256 amountToStake, address staker) {
        return finalizeBridging(depositKey);
    }

    function exposed_setQueuedStakesBalance(uint256 amount) external {
        queuedStakesBalance = amount;
    }
}
