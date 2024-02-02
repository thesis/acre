// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {MockBridge} from "@keep-network/tbtc-v2/contracts/test/TestTBTCDepositor.sol";
import {IBridgeTypes} from "@keep-network/tbtc-v2/contracts/integrator/IBridge.sol";
import {TestERC20} from "./TestERC20.sol";

contract BridgeStub is MockBridge {}
