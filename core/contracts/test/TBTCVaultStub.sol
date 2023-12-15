// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;
import {ITBTCVault} from "../tbtc/TbtcDepositor.sol";

contract TBTCVaultStub is ITBTCVault {
    uint32 public optimisticMintingFeeDivisor = 500; // 1/500 = 0.002 = 0.2%

    //   request.optimisticMintFee = optimisticMintingFeeDivisor > 0
    //     ? (amountToMint / optimisticMintingFeeDivisor)
    //     : 0;

    function optimisticMintingRequests(
        uint256 depositKey
    ) external returns (OptimisticMintingRequest memory) {
        OptimisticMintingRequest memory result;
        return result;
    }
}
