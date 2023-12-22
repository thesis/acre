// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;
import {ITBTCVault} from "../tbtc/TbtcDepositor.sol";
import {TestERC20} from "./TestERC20.sol";

contract TBTCVaultStub is ITBTCVault {
    TestERC20 tbtc;

    /// @notice Multiplier to convert satoshi to TBTC token units.
    uint256 public constant SATOSHI_MULTIPLIER = 10 ** 10;

    uint32 public optimisticMintingFeeDivisor = 500; // 1/500 = 0.002 = 0.2%

    //   request.optimisticMintFee = optimisticMintingFeeDivisor > 0
    //     ? (amountToMint / optimisticMintingFeeDivisor)
    //     : 0;

    constructor(TestERC20 _tbtc) {
        tbtc = _tbtc;
    }

    function optimisticMintingRequests(
        uint256 depositKey
    ) external returns (OptimisticMintingRequest memory) {
        OptimisticMintingRequest memory result;
        return result;
    }

    function mintTbtc(address account, uint256 valueSat) public {
        tbtc.mint(account, valueSat * SATOSHI_MULTIPLIER);
    }
}
