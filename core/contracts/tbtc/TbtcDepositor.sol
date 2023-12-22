// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {BTCUtils} from "@keep-network/bitcoin-spv-sol/contracts/BTCUtils.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {IBridge} from "../external/tbtc/IBridge.sol";
import {ITBTCVault} from "../external/tbtc/ITBTCVault.sol";
import {Acre} from "../Acre.sol";

// TODO: Add Missfund token protection.
contract TbtcDepositor {
    using BTCUtils for bytes;
    using SafeERC20 for IERC20;

    struct DepositRequest {
        // Receiver of the stBTC token.
        address receiver;
        // Referral for the stake operation.
        uint16 referral;
        // UNIX timestamp at which the optimistic minting was requested.
        uint64 requestedAt;
        // UNIX timestamp at which the optimistic minting was finalized.
        // 0 if not yet finalized.
        uint64 finalizedAt;
        // Maximum Deposit Transaction Fee snapshotted from the Bridge contract
        // at the moment of deposit reveal.
        uint256 depositTxMaxFee;
        // Optimistic Minting Fee Divisor snapshotted from the TBTC Vault contract
        // at the moment of deposit reveal.
        uint32 optimisticMintingFeeDivisor;
    }

    IBridge public bridge;
    ITBTCVault public tbtcVault;
    Acre public acre;

    mapping(uint256 => DepositRequest) public depositRequests;

    /// @notice Multiplier to convert satoshi to tBTC token units.
    uint256 public constant SATOSHI_MULTIPLIER = 10 ** 10;

    constructor(IBridge _bridge, ITBTCVault _tbtcVault, Acre _acre) {
        bridge = _bridge;
        tbtcVault = _tbtcVault;
        acre = _acre;
    }

    /// @notice Returns minimum deposit amount in Satoshi
    function minDepositAmountSat() public view returns (uint256) {
        (uint64 bridgeDepositDustThresholdSat, , , ) = bridge
            .depositParameters();

        uint256 acreMinimumDepositAmountSat = acre.minimumDepositAmount() /
            SATOSHI_MULTIPLIER;

        return
            Math.max(
                bridgeDepositDustThresholdSat,
                acreMinimumDepositAmountSat
            );
    }

    // Extra Data 32 byte
    // receiver - address - 20 byte
    // referral - uint16 - 2 byte
    function initializeDeposit(
        IBridge.BitcoinTxInfo calldata fundingTx,
        IBridge.DepositRevealInfo calldata reveal,
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

        DepositRequest storage request = depositRequests[
            calculateDepositKey(fundingTxHash, reveal.fundingOutputIndex)
        ];

        // TODO: Replace with custom errors
        require(request.requestedAt == 0, "deposit already initialized");

        // solhint-disable-next-line not-rely-on-time
        request.requestedAt = uint64(block.timestamp);

        // First 20 bytes of extra data is receiver address.
        request.receiver = address(uint160(bytes20(extraData)));
        // Next 2 bytes of extra data is referral info.
        request.referral = uint16(bytes2(extraData << (8 * 20)));

        require(request.receiver != address(0), "receiver cannot be zero");

        // Reveal the deposit to tBTC Bridge contract.
        bridge.revealDepositWithExtraData(fundingTx, reveal, extraData);

        // Store Deposit Transaction Max Fee.
        (, , uint64 depositTxMaxFee, ) = bridge.depositParameters();
        request.depositTxMaxFee = depositTxMaxFee;

        // Store Optimistic Minting Fee Divisor.
        request.optimisticMintingFeeDivisor = tbtcVault
            .optimisticMintingFeeDivisor();
    }

    function finalizeDeposit(uint256 depositKey) external {
        DepositRequest storage request = depositRequests[depositKey];

        // TODO: Replace with custom errors
        require(request.requestedAt > 0, "deposit not initialized");
        require(request.finalizedAt == 0, "deposit already finalized");

        // Set finalization timestamp.
        // solhint-disable-next-line not-rely-on-time
        request.finalizedAt = uint64(block.timestamp);

        // Get deposit details from tBTC contracts.
        IBridge.DepositRequest memory bridgeDepositRequest = bridge.deposits(
            depositKey
        );
        ITBTCVault.OptimisticMintingRequest
            memory optimisticMintingRequest = tbtcVault
                .optimisticMintingRequests(depositKey);

        // tBTC amount calculation.
        // - for optimistically minted deposits:
        //   amount = depositAmount - depositTreasuryFee - depositTxMaxFee - optimisticMintingFee
        // - for swept deposits.
        //   amount = depositAmount - depositTreasuryFee - depositTxMaxFee
        //
        // NOTE: These calculation are simplified and can leave some positive
        // imbalance in this contract.
        // - depositTxMaxFee - this is a maximum transaction fee that can be deducted
        //   on Bitcoin transaction sweeping,
        // - optimisticMintingFee - this is a optimistic minting fee snapshotted
        //   at the moment of the reveal, minting finalization can be completed;
        //   the final value deducted on optimistic minting finalization can change
        //   in the meantime.
        // The imbalance should be donated to the Acre staking contract.

        // Extract initial value sent by the user.
        uint256 fundingTxAmount = bridgeDepositRequest.amount;

        uint256 amountToStakeSat = (fundingTxAmount -
            bridgeDepositRequest.treasuryFee -
            request.depositTxMaxFee);

        // TODO: Revisit logic to find edge cases of mixed minting paths.
        // Check if deposit was optimistically minted.
        if (optimisticMintingRequest.finalizedAt > 0) {
            // TODO: Consider checking optimisticMintingFee once again and take
            // the max(optimisticMintingFeeOnReval, optimisticMintingFeeOnFinalize)
            // Subtract optimistic minting fee.
            uint256 optimisticMintingFeeDivisor = request
                .optimisticMintingFeeDivisor;

            uint256 optimisticMintingFee = optimisticMintingFeeDivisor > 0
                ? (fundingTxAmount / optimisticMintingFeeDivisor)
                : 0;

            amountToStakeSat -= optimisticMintingFee;
            // If not optimistically minted check if deposit was swept.
        } else {
            require(
                bridgeDepositRequest.sweptAt > 0,
                "tbtc bridge deposit not swept"
            );
        }

        uint256 amountToStakeTbtc = amountToStakeSat * SATOSHI_MULTIPLIER;

        // Stake tBTC in Acre.
        IERC20(acre.asset()).safeIncreaseAllowance(
            address(acre),
            amountToStakeTbtc
        );
        // TODO: Figure out what to do if deposit limit is reached in Acre
        acre.stake(amountToStakeTbtc, request.receiver, request.referral);
    }

    /// @notice Calculates deposit key the same way as the Bridge contract.
    ///         The deposit key is computed as
    ///         `keccak256(fundingTxHash | fundingOutputIndex)`.
    function calculateDepositKey(
        bytes32 fundingTxHash,
        uint32 fundingOutputIndex
    ) public pure returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(fundingTxHash, fundingOutputIndex))
            );
    }
}
