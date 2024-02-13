// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {TbtcDepositor} from "../TbtcDepositor.sol";

/// @dev A test contract to expose internal function from  TbtcDepositor contract.
///      This solution follows Foundry recommendation:
///      https://book.getfoundry.sh/tutorials/best-practices#internal-functions
contract TbtcDepositorHarness is TbtcDepositor {
    constructor(
        address _bridge,
        address _tbtcVault,
        address _tbtcToken,
        address _stbtc
    ) TbtcDepositor(_bridge, _tbtcVault, _tbtcToken, _stbtc) {}

    function exposed_finalizeBridging(
        uint256 depositKey
    ) external returns (uint256 amountToStake, address receiver) {
        return finalizeBridging(depositKey);
    }
}
