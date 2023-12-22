// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {BTCUtils} from "@keep-network/bitcoin-spv-sol/contracts/BTCUtils.sol";
import {IBridge} from "../external/tbtc/IBridge.sol";
import {TBTCVaultStub} from "./TBTCVaultStub.sol";

contract BridgeStub is IBridge {
    using BTCUtils for bytes;

    TBTCVaultStub tbtcVault;

    mapping(uint256 => DepositRequest) depositsMap;

    constructor(TBTCVaultStub _tbtcVault) {
        tbtcVault = _tbtcVault;
    }

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

        DepositRequest storage deposit = depositsMap[
            calculateDepositKey(fundingTxHash, reveal.fundingOutputIndex)
        ];

        require(deposit.revealedAt == 0, "Deposit already revealed");

        bytes memory fundingOutput = fundingTx
            .outputVector
            .extractOutputAtIndex(reveal.fundingOutputIndex);

        uint64 fundingOutputAmount = fundingOutput.extractValue();

        (
            uint64 depositDustThreshold,
            uint64 depositTreasuryFeeDivisor,
            ,

        ) = depositParameters();

        require(
            fundingOutputAmount >= depositDustThreshold,
            "Deposit amount too small"
        );

        deposit.amount = fundingOutputAmount;
        deposit.depositor = msg.sender;
        /* solhint-disable-next-line not-rely-on-time */
        deposit.revealedAt = uint32(block.timestamp);
        deposit.vault = reveal.vault;
        deposit.treasuryFee = depositTreasuryFeeDivisor > 0
            ? fundingOutputAmount / depositTreasuryFeeDivisor
            : 0;
        deposit.extraData = extraData;
    }

    function deposits(
        uint256 depositKey
    ) external view returns (DepositRequest memory) {
        return depositsMap[depositKey];
    }

    function sweep(bytes32 fundingTxHash, uint32 fundingOutputIndex) public {
        DepositRequest storage deposit = depositsMap[
            calculateDepositKey(fundingTxHash, fundingOutputIndex)
        ];

        deposit.sweptAt = uint32(block.timestamp);

        (, , uint64 depositTxMaxFee, ) = depositParameters();
        // For test purposes as deposit tx fee we take value lower than the max
        // possible value as this follows how Bridge may sweep the deposit
        // with a fee lower than the max.
        // Here we arbitrary choose the deposit tx fee to be at 80% of max deposit fee.
        uint64 depositTxFee = (depositTxMaxFee * 8) / 10;

        uint64 amountToMintSat = deposit.amount -
            deposit.treasuryFee -
            depositTxFee;

        // TODO: Mint TBTC
        tbtcVault.mintTbtc(deposit.depositor, amountToMintSat);
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
        public
        view
        returns (
            uint64 depositDustThreshold,
            uint64 depositTreasuryFeeDivisor,
            uint64 depositTxMaxFee,
            uint32 depositRevealAheadPeriod
        )
    {
        // The values returned here are tweaked for test purposes. These are not
        // the exact values used in the Bridge contract on mainnet.
        // See: https://github.com/keep-network/tbtc-v2/blob/103411a595c33895ff6bff8457383a69eca4963c/solidity/test/bridge/Bridge.Deposit.test.ts#L70-L77
        return (
            10000, // 10000 satoshi = 0.0001 BTC
            2000, // 1/2000 == 5bps == 0.05% == 0.0005
            1000, // 1000 satoshi = 0.00001 BTC
            15 days
        );
    }
}
