// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@keep-network/tbtc-v2/contracts/integrator/AbstractTBTCDepositor.sol";

contract TbtcDepositor is AbstractTBTCDepositor {
    function initializeStakeRequest(
        IBridgeTypes.BitcoinTxInfo calldata fundingTx,
        IBridgeTypes.DepositRevealInfo calldata reveal,
        address receiver,
        uint16 referral
    ) external {}
}
