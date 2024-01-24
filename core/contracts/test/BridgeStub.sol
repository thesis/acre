// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {BTCUtils} from "@keep-network/bitcoin-spv-sol/contracts/BTCUtils.sol";
import {IBridge} from "../external/tbtc/IBridge.sol";
import {TestERC20} from "./TestERC20.sol";

contract BridgeStub is IBridge {
    using BTCUtils for bytes;

    TestERC20 public tbtc;

    /// @notice Multiplier to convert satoshi to TBTC token units.
    uint256 public constant SATOSHI_MULTIPLIER = 10 ** 10;

    // The values set here are tweaked for test purposes. These are not
    // the exact values used in the Bridge contract on mainnet.
    // See: https://github.com/keep-network/tbtc-v2/blob/103411a595c33895ff6bff8457383a69eca4963c/solidity/test/bridge/Bridge.Deposit.test.ts#L70-L77
    uint64 public depositDustThreshold = 10000; // 10000 satoshi = 0.0001 BTC
    uint64 public depositTreasuryFeeDivisor = 2000; // 1/2000 == 5bps == 0.05% == 0.0005
    uint64 public depositTxMaxFee = 1000; // 1000 satoshi = 0.00001 BTC
    uint32 public depositRevealAheadPeriod = 15 days;

    // Used in tests to fake invalid depositor being set.
    address overrideDepositor;

    mapping(uint256 => DepositRequest) internal depositsMap;

    constructor(TestERC20 _tbtc) {
        tbtc = _tbtc;
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

        require(
            fundingOutputAmount >= depositDustThreshold,
            "Deposit amount too small"
        );

        deposit.amount = fundingOutputAmount;
        deposit.depositor = overrideDepositor != address(0)
            ? overrideDepositor
            : msg.sender;
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

    function sweep(bytes32 fundingTxHash, uint32 fundingOutputIndex) external {
        DepositRequest storage deposit = depositsMap[
            calculateDepositKey(fundingTxHash, fundingOutputIndex)
        ];

        // solhint-disable-next-line not-rely-on-time
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

        tbtc.mint(deposit.depositor, amountToMintSat * SATOSHI_MULTIPLIER);
    }

    function depositParameters()
        public
        view
        returns (uint64, uint64, uint64, uint32)
    {
        return (
            depositDustThreshold,
            depositTreasuryFeeDivisor,
            depositTxMaxFee,
            depositRevealAheadPeriod
        );
    }

    function calculateDepositKey(
        bytes32 fundingTxHash,
        uint32 fundingOutputIndex
    ) private pure returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(fundingTxHash, fundingOutputIndex))
            );
    }

    function setDepositDustThreshold(uint64 _depositDustThreshold) external {
        depositDustThreshold = _depositDustThreshold;
    }

    function setDepositTreasuryFeeDivisor(
        uint64 _depositTreasuryFeeDivisor
    ) external {
        depositTreasuryFeeDivisor = _depositTreasuryFeeDivisor;
    }

    function setDepositTxMaxFee(uint64 _depositTxMaxFee) external {
        depositTxMaxFee = _depositTxMaxFee;
    }

    function setDepositorOverride(address depositor) external {
        overrideDepositor = depositor;
    }
}
