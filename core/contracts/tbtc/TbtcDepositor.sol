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
// TODO: Make Upgradable

/// @title tBTC Depositor contract.
/// @notice The contract integrates Acre staking with tBTC minting.
///         User who wants to stake BTC in Acre should submit a Bitcoin transaction
///         to the most recently created off-chain ECDSA wallets of the tBTC Bridge
///         using pay-to-script-hash (P2SH) or pay-to-witness-script-hash (P2WSH)
///         containing hashed information about this Depositor contract address,
///         and staker's Ethereum address.
///         Then, the staker initiates tBTC minting by revealing their Ethereum
///         address along with their deposit blinding factor, refund public key
///         hash and refund locktime on the tBTC Bridge through this Depositor
///         contract.
///         The off-chain ECDSA wallet listens for these sorts of
///         messages and when it gets one, it checks the Bitcoin network to make
///         sure the deposit lines up. If it does, the off-chain ECDSA wallet
///         may decide to pick the deposit transaction for sweeping, and when
///         the sweep operation is confirmed on the Bitcoin network, the tBTC Bridge
///         and tBTC vault mint the tBTC token to the Depositor address.
///         After tBTC is minted to the Depositor, on the stake finalization
///         tBTC is staked in Acre contract and stBTC shares are emitted to the
///         receiver pointed by the staker.
contract TbtcDepositor {
    using BTCUtils for bytes;
    using SafeERC20 for IERC20;

    struct StakeRequest {
        // UNIX timestamp at which the deposit request was initialized.
        uint64 requestedAt;
        // UNIX timestamp at which the deposit request was finalized.
        // 0 if not yet finalized.
        uint64 finalizedAt;
        // Maximum tBTC Deposit Transaction Fee snapshotted from the Bridge
        // contract at the moment of deposit reveal.
        uint64 tbtcDepositTxMaxFee;
        // tBTC Optimistic Minting Fee Divisor snapshotted from the TBTC Vault
        // contract at the moment of deposit reveal.
        uint32 tbtcOptimisticMintingFeeDivisor;
    }

    /// @notice tBTC Bridge contract.
    IBridge public bridge;
    /// @notice tBTC Vault contract.
    ITBTCVault public tbtcVault;
    /// @notice Acre contract.
    Acre public acre;

    /// @notice Mapping of stake requests.
    /// @dev The key is a deposit key computed in the same way as in tBTC Bridge:
    ///      `keccak256(fundingTxHash | fundingOutputIndex)`.
    mapping(uint256 => StakeRequest) public stakeRequests;

    /// @notice Multiplier to convert satoshi (8 decimals precision) to tBTC
    ///         token units (18 decimals precision).
    uint256 public constant SATOSHI_MULTIPLIER = 10 ** 10;

    // TODO: Decide if leave or remove?
    uint64 public minimumFundingTransactionAmount;

    /// @dev Receiver address is zero.
    error ReceiverIsZeroAddress();
    /// @dev Attempted to initiate a stake request that was already initialized.
    error StakeRequestAlreadyInProgress();
    /// @dev Attempted to finalize a stake request that has not been initialized.
    error StakeRequestNotInitialized();
    /// @dev Attempted to finalize a stake request that was already finalized.
    error StakeRequestAlreadyFinalized();
    /// @dev Depositor address stored in the Deposit Request in the tBTC Bridge
    ///      contract doesn't match the current contract address.
    error UnexpectedDepositor(address bridgeDepositRequestDepositor);
    /// @dev Deposit was not completed on the tBTC side and tBTC was not minted
    ///      to the depositor contract. It is thrown when the deposit neither has
    ///      been optimistically minted nor swept.
    error TbtcDepositNotCompleted();

    /// @notice Tbtc Depositor contract constructor.
    /// @param _bridge tBTC Bridge contract instance.
    /// @param _tbtcVault tBTC Vault contract instance.
    /// @param _acre Acre contract instance.
    constructor(IBridge _bridge, ITBTCVault _tbtcVault, Acre _acre) {
        bridge = _bridge;
        tbtcVault = _tbtcVault;
        acre = _acre;
    }

    /// @notice This function allows staking process initialization for a Bitcoin
    ///         deposit made by an user with a P2(W)SH transaction. It uses the
    ///         supplied information to reveal a deposit to the tBTC Bridge contract.
    /// @dev Requirements:
    ///      - `reveal.walletPubKeyHash` must identify a `Live` wallet,
    ///      - `reveal.vault` must be 0x0 or point to a trusted vault,
    ///      - `reveal.fundingOutputIndex` must point to the actual P2(W)SH
    ///        output of the BTC deposit transaction,
    ///      - `reveal.blindingFactor` must be the blinding factor used in the
    ///        P2(W)SH BTC deposit transaction,
    ///      - `reveal.walletPubKeyHash` must be the wallet pub key hash used in
    ///        the P2(W)SH BTC deposit transaction,
    ///      - `reveal.refundPubKeyHash` must be the refund pub key hash used in
    ///        the P2(W)SH BTC deposit transaction,
    ///      - `reveal.refundLocktime` must be the refund locktime used in the
    ///        P2(W)SH BTC deposit transaction,
    ///      - `receiver` must be the receiver address used in the P2(W)SH BTC
    ///        deposit transaction as part of the extra data.
    ///      - `referral` must be the referral info used in the P2(W)SH BTC
    ///        deposit transaction as part of the extra data.
    ///      - BTC deposit for the given `fundingTxHash`, `fundingOutputIndex`
    ///        can be revealed only one time.
    ///
    ///      If any of these requirements is not met, the wallet _must_ refuse
    ///      to sweep the deposit and the depositor has to wait until the
    ///      deposit script unlocks to receive their BTC back.
    /// @param fundingTx Bitcoin funding transaction data, see `IBridge.BitcoinTxInfo`.
    /// @param reveal Deposit reveal data, see `IBridge.DepositRevealInfo`.
    /// @param receiver The address to which the stBTC shares will be minted.
    /// @param referral Data used for referral program.
    function initializeStake(
        IBridge.BitcoinTxInfo calldata fundingTx,
        IBridge.DepositRevealInfo calldata reveal,
        address receiver,
        uint16 referral
    ) external {
        if (receiver == address(0)) revert ReceiverIsZeroAddress();

        // Calculate Bitcoin transaction hash.
        bytes32 fundingTxHash = abi
            .encodePacked(
                fundingTx.version,
                fundingTx.inputVector,
                fundingTx.outputVector,
                fundingTx.locktime
            )
            .hash256View();

        StakeRequest storage request = stakeRequests[
            calculateDepositKey(fundingTxHash, reveal.fundingOutputIndex)
        ];

        if (request.requestedAt > 0) revert StakeRequestAlreadyInProgress();

        // solhint-disable-next-line not-rely-on-time
        request.requestedAt = uint64(block.timestamp);

        // Reveal the deposit to tBTC Bridge contract.
        bridge.revealDepositWithExtraData(
            fundingTx,
            reveal,
            encodeExtraData(receiver, referral)
        );

        // Snapshot parameters required for fee calculation.
        (, , request.tbtcDepositTxMaxFee, ) = bridge.depositParameters();
        request.tbtcOptimisticMintingFeeDivisor = tbtcVault
            .optimisticMintingFeeDivisor();
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC minting process completed and tBTC was deposited
    ///         in this Depositor contract.
    /// @dev It calculates the amount to stake in Acre contract by deducting
    ///      tBTC network minting fees from the initial funding transaction amount.
    ///      The amount to stake is calculated depending on the process the tBTC
    ///      was minted in:
    ///      - for swept deposits:
    ///        `amount = depositAmount - depositTreasuryFee - depositTxMaxFee`
    ///      - for optimistically minted deposits:
    ///        ```
    ///        amount = depositAmount - depositTreasuryFee - depositTxMaxFee
    ///               - optimisticMintingFee
    ///        ```
    ///      These calculation are simplified and can leave some positive
    ///      imbalance in the Depositor contract.
    ///      - depositTxMaxFee - this is a maximum transaction fee that can be deducted
    ///        on Bitcoin transaction sweeping,
    ///      - optimisticMintingFee - this is a optimistic minting fee snapshotted
    ///        at the moment of the deposit reveal, there is a chance that the fee
    ///        parameter is updated in the tBTC Vault contract before the optimistic
    ///        minting is finalized.
    ///      The imbalance is considered a part of the depositor fee.
    /// @param depositKey Deposit key computed as
    ///                   `keccak256(fundingTxHash | fundingOutputIndex)`.
    function finalizeStake(uint256 depositKey) external {
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.requestedAt == 0) revert StakeRequestNotInitialized();
        if (request.finalizedAt > 0) revert StakeRequestAlreadyFinalized();

        // solhint-disable-next-line not-rely-on-time
        request.finalizedAt = uint64(block.timestamp);

        // Get deposit details from tBTC Bridge and Vault contracts.
        IBridge.DepositRequest memory bridgeDepositRequest = bridge.deposits(
            depositKey
        );
        ITBTCVault.OptimisticMintingRequest
            memory optimisticMintingRequest = tbtcVault
                .optimisticMintingRequests(depositKey);

        // Check if Depositor revealed to the tBTC Bridge contract matches the
        // current contract address.
        if (bridgeDepositRequest.depositor != address(this))
            revert UnexpectedDepositor(bridgeDepositRequest.depositor);

        // Extract funding transaction amount sent by the user in Bitcoin transaction.
        uint256 fundingTxAmount = bridgeDepositRequest.amount;

        uint256 amountToStakeSat = (fundingTxAmount -
            bridgeDepositRequest.treasuryFee -
            request.tbtcDepositTxMaxFee);

        // Check if deposit was optimistically minted.
        if (optimisticMintingRequest.finalizedAt > 0) {
            // For tBTC minted with optimistic minting process additional fee
            // is taken. The fee is calculated on `TBTCVault.finalizeOptimisticMint`
            // call, and not stored in the contract.
            // There is a possibility the fee has changed since the snapshot of
            // the `tbtcOptimisticMintingFeeDivisor`, to cover this scenario
            // in fee computation we use the bigger of these.
            uint256 optimisticMintingFeeDivisor = Math.max(
                request.tbtcOptimisticMintingFeeDivisor,
                tbtcVault.optimisticMintingFeeDivisor()
            );

            uint256 optimisticMintingFee = optimisticMintingFeeDivisor > 0
                ? (fundingTxAmount / optimisticMintingFeeDivisor)
                : 0;

            amountToStakeSat -= optimisticMintingFee;
        } else {
            // If the deposit wan't optimistically minted check if it was swept.
            if (bridgeDepositRequest.sweptAt == 0)
                revert TbtcDepositNotCompleted();
        }

        // Convert amount in satoshi to tBTC token precision.
        uint256 amountToStakeTbtc = amountToStakeSat * SATOSHI_MULTIPLIER;

        // Fetch receiver and referral stored in extra data in tBTC Bridge Deposit
        // Request.
        bytes32 extraData = bridgeDepositRequest.extraData;
        (address receiver, uint16 referral) = decodeExtraData(extraData);

        // Stake tBTC in Acre.
        IERC20(acre.asset()).safeIncreaseAllowance(
            address(acre),
            amountToStakeTbtc
        );
        // TODO: Figure out what to do if deposit limit is reached in Acre
        // TODO: Consider extracting stake function with referrals from Acre to this contract.
        acre.stake(amountToStakeTbtc, receiver, referral);
    }
    // TODO: Handle minimum deposit amount in tBTC Bridge vs Acre.

    /// @notice Calculates deposit key the same way as the Bridge contract.
    /// @dev The deposit key is computed as
    ///      `keccak256(fundingTxHash | fundingOutputIndex)`.
    /// @param fundingTxHash Bitcoin transaction hash (ordered as in Bitcoin internally)
    /// @param fundingOutputIndex Output in Bitcoin transaction used to fund
    ///        the deposit.
    /// @return Calculated Deposit Key.
    function calculateDepositKey(
        bytes32 fundingTxHash,
        uint32 fundingOutputIndex
    ) public pure returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(fundingTxHash, fundingOutputIndex))
            );
    }

    /// @notice Encode receiver address and referral as extra data.
    /// @dev Packs the data to bytes32: 20 bytes of receiver address and
    ///      2 bytes of referral, 10 bytes of trailing zeros.
    /// @param receiver The address to which the stBTC shares will be minted.
    /// @param referral Data used for referral program.
    /// @return Encoded extra data.
    function encodeExtraData(
        address receiver,
        uint16 referral
    ) public pure returns (bytes32) {
        return bytes32(abi.encodePacked(receiver, referral));
    }

    /// @notice Decodes receiver address and referral from extra data,
    /// @dev Unpacks the data from bytes32: 20 bytes of receiver address and
    ///      2 bytes of referral, 10 bytes of trailing zeros.
    /// @param extraData Encoded extra data.
    /// @return receiver The address to which the stBTC shares will be minted.
    /// @return referral Data used for referral program.
    function decodeExtraData(
        bytes32 extraData
    ) public pure returns (address receiver, uint16 referral) {
        // First 20 bytes of extra data is receiver address.
        receiver = address(uint160(bytes20(extraData)));
        // Next 2 bytes of extra data is referral info.
        referral = uint16(bytes2(extraData << (8 * 20)));
    }
}
