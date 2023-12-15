// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {BTCUtils} from "@keep-network/bitcoin-spv-sol/contracts/BTCUtils.sol";
import {IBridge} from "../tbtc/TbtcDepositor.sol";

contract BridgeStub is IBridge {
    using BTCUtils for bytes;

    mapping(uint256 => DepositRequest) dep;

    uint64 depositTreasuryFeeDivisor = 2000; // 0.05%

    function revealDepositWithExtraData(
        BitcoinTxInfo calldata fundingTx,
        DepositRevealInfo calldata reveal,
        bytes32 extraData
    ) external {
        bytes32 fundingTxHash = abi
            .encodePacked(
                fundingTx.version,
                fundingTx.inputVector,
                fundingTx.outputVector,
                fundingTx.locktime
            )
            .hash256View();

        DepositRequest storage deposit = dep[
            calculateDepositKey(fundingTxHash, reveal.fundingOutputIndex)
        ];

        require(deposit.revealedAt == 0, "Deposit already revealed");

        bytes memory fundingOutput = fundingTx
            .outputVector
            .extractOutputAtIndex(reveal.fundingOutputIndex);

        uint64 fundingOutputAmount = fundingOutput.extractValue();

        deposit.amount = fundingOutputAmount;
        deposit.depositor = msg.sender;
        /* solhint-disable-next-line not-rely-on-time */
        deposit.revealedAt = uint32(block.timestamp);
        deposit.vault = reveal.vault;
        deposit.treasuryFee = depositTreasuryFeeDivisor > 0
            ? fundingOutputAmount / depositTreasuryFeeDivisor
            : 0;
    }

    function deposits(
        uint256 depositKey
    ) external view returns (DepositRequest memory) {
        return dep[depositKey];
    }

    function sweep(bytes32 fundingTxHash, uint32 fundingOutputIndex) public {
        DepositRequest storage deposit = dep[
            calculateDepositKey(fundingTxHash, fundingOutputIndex)
        ];

        deposit.sweptAt = uint32(block.timestamp);

        // TODO: Mint TBTC
    }

    function calculateDepositKey(
        bytes32 fundingTxHash,
        uint32 fundingOutputIndex
    ) public pure returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(fundingTxHash, fundingOutputIndex))
            );
    }

    function depositParameters()
        external
        view
        returns (
            uint64 depositDustThreshold,
            uint64 depositTreasuryFeeDivisor,
            uint64 depositTxMaxFee,
            uint32 depositRevealAheadPeriod
        )
    {
        return (
            1000000, // 1000000 satoshi = 0.01 BTC
            2000, // 1/2000 == 5bps == 0.05% == 0.0005
            100000, // 100000 satoshi = 0.001 BTC
            15 days
        );
    }
}
