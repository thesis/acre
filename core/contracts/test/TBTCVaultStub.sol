// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;
import {ITBTCVault} from "../tbtc/TbtcDepositor.sol";
import {IBridge} from "../external/tbtc/IBridge.sol";
import {TestERC20} from "./TestERC20.sol";

contract TBTCVaultStub is ITBTCVault {
    TestERC20 public tbtc;
    IBridge public bridge;

    /// @notice Multiplier to convert satoshi to TBTC token units.
    uint256 public constant SATOSHI_MULTIPLIER = 10 ** 10;

    uint32 public optimisticMintingFeeDivisor = 500; // 1/500 = 0.002 = 0.2%

    mapping(uint256 => OptimisticMintingRequest) public requests;

    constructor(TestERC20 _tbtc, IBridge _bridge) {
        tbtc = _tbtc;
        bridge = _bridge;
    }

    function optimisticMintingRequests(
        uint256 depositKey
    ) external view returns (OptimisticMintingRequest memory) {
        return requests[depositKey];
    }

    function mintTbtc(address account, uint256 valueSat) public {
        tbtc.mint(account, valueSat * SATOSHI_MULTIPLIER);
    }

    function finalizeOptimisticMinting(uint256 depositKey) external {
        OptimisticMintingRequest storage request = requests[depositKey];

        IBridge.DepositRequest memory deposit = bridge.deposits(depositKey);

        uint256 amountToMint = (deposit.amount - deposit.treasuryFee) *
            SATOSHI_MULTIPLIER;

        uint256 optimisticMintFee = optimisticMintingFeeDivisor > 0
            ? (amountToMint / optimisticMintingFeeDivisor)
            : 0;

        tbtc.mint(deposit.depositor, amountToMint - optimisticMintFee);

        /* solhint-disable-next-line not-rely-on-time */
        request.finalizedAt = uint64(block.timestamp);
    }

    function setOptimisticMintingFeeDivisor(
        uint32 _optimisticMintingFeeDivisor
    ) public {
        optimisticMintingFeeDivisor = _optimisticMintingFeeDivisor;
    }
}
