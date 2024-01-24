// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {BTCUtils} from "@keep-network/bitcoin-spv-sol/contracts/BTCUtils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
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
contract TbtcDepositor is Ownable {
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
        // tBTC token amount to stake after deducting tBTC minting fees and the
        // Depositor fee.
        uint256 amountToStake;
    }

    /// @notice tBTC Bridge contract.
    IBridge public bridge;
    /// @notice tBTC Vault contract.
    ITBTCVault public tbtcVault;
    /// @notice tBTC Token contract.
    IERC20 public immutable tbtcToken;
    /// @notice Acre contract.
    Acre public acre;

    /// @notice Mapping of stake requests.
    /// @dev The key is a deposit key computed in the same way as in tBTC Bridge:
    ///      `keccak256(fundingTxHash | fundingOutputIndex)`.
    mapping(uint256 => StakeRequest) public stakeRequests;

    /// @notice Multiplier to convert satoshi (8 decimals precision) to tBTC
    ///         token units (18 decimals precision).
    uint256 public constant SATOSHI_MULTIPLIER = 10 ** 10;

    /// @notice Divisor used to compute the depositor fee taken from each deposit
    ///         and transferred to the treasury upon stake request finalization.
    /// @dev That fee is computed as follows:
    ///      `depositorFee = depositedAmount / depositorFeeDivisor`
    ///       for example, if the depositor fee needs to be 2% of each deposit,
    ///       the `depositorFeeDivisor` should be set to `50` because
    ///       `1/50 = 0.02 = 2%`.
    uint64 public depositorFeeDivisor;

    /// @notice Emitted when a stake request is initialized.
    /// @dev Deposit details can be fetched from {{ Bridge.DepositRevealed }}
    ///      event emitted in the same transaction.
    /// @param depositKey Deposit identifier.
    /// @param caller Address that initialized the stake request.
    /// @param receiver The address to which the stBTC shares will be minted.
    /// @param referral Data used for referral program.
    event StakeInitialized(
        uint256 indexed depositKey,
        address indexed caller,
        address receiver,
        uint16 referral
    );

    /// @notice Emitted when bridging completion has been notified.
    /// @param depositKey Deposit identifier.
    /// @param caller Address that notified about bridging completion.
    /// @param amountToStake Amount of tBTC token that is available to stake.
    event BridgingCompleted(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 amountToStake
    );

    /// @notice Emitted when a stake request is finalized.
    /// @dev Deposit details can be fetched from {{ ERC4626.Deposit }}
    ///      event emitted in the same transaction.
    /// @param depositKey Deposit identifier.
    /// @param caller Address that finalized the stake request.
    event StakeFinalized(uint256 indexed depositKey, address indexed caller);

    /// @notice Emitted when a stake request is recalled.
    /// @param depositKey Deposit identifier.
    /// @param caller Address that called the function to recall the stake.
    event StakeRecalled(uint256 indexed depositKey, address indexed caller);

    /// @notice Emitted when a depositor fee divisor is updated.
    /// @param depositorFeeDivisor New value of the depositor fee divisor.
    event DepositorFeeDivisorUpdated(uint64 depositorFeeDivisor);

    /// @dev Receiver address is zero.
    error ReceiverIsZeroAddress();

    /// @dev Attempted to initiate a stake request that was already initialized.
    error StakeRequestAlreadyInProgress();

    /// @dev Attempted to finalize a stake request that has not been initialized.
    error StakeRequestNotInitialized();

    /// @dev Attempted to notify about completed bridging while the notification
    ///      was already submitted.
    error BridgingAlreadyCompleted();

    /// @dev Attempted to finalize a stake request, while bridging completion has
    /// not been notified yet.
    error BridgingNotCompleted();

    /// @dev Attempted to finalize a stake request that was already finalized.
    error StakeRequestAlreadyFinalized();

    /// @dev Attempted to call function by an account that is not the receiver.
    error CallerNotReceiver();

    /// @dev Depositor address stored in the Deposit Request in the tBTC Bridge
    ///      contract doesn't match the current contract address.
    error UnexpectedDepositor(address bridgeDepositRequestDepositor);

    /// @dev Vault address stored in the Deposit Request in the tBTC Bridge
    ///      contract doesn't match the expected tBTC Vault contract address.
    error UnexpectedTbtcVault(address bridgeDepositRequestVault);

    /// @dev Deposit was not completed on the tBTC side and tBTC was not minted
    ///      to the depositor contract. It is thrown when the deposit neither has
    ///      been optimistically minted nor swept.
    error TbtcDepositNotCompleted();

    /// @notice Tbtc Depositor contract constructor.
    /// @param _bridge tBTC Bridge contract instance.
    /// @param _tbtcVault tBTC Vault contract instance.
    /// @param _acre Acre contract instance.
    constructor(
        IBridge _bridge,
        ITBTCVault _tbtcVault,
        IERC20 _tbtcToken,
        Acre _acre
    ) Ownable(msg.sender) {
        bridge = _bridge;
        tbtcVault = _tbtcVault;
        tbtcToken = _tbtcToken;
        acre = _acre;

        depositorFeeDivisor = 0; // Depositor fee is disabled initially.
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
    function initializeStakeRequest(
        IBridge.BitcoinTxInfo calldata fundingTx,
        IBridge.DepositRevealInfo calldata reveal,
        address receiver,
        uint16 referral
    ) external {
        // Check if Vault revealed to the tBTC Bridge contract matches the
        // tBTC Vault supported by this contract.
        if (reveal.vault != address(tbtcVault))
            revert UnexpectedTbtcVault(reveal.vault);

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

        uint256 depositKey = calculateDepositKey(
            fundingTxHash,
            reveal.fundingOutputIndex
        );
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.requestedAt > 0) revert StakeRequestAlreadyInProgress();

        emit StakeInitialized(depositKey, msg.sender, receiver, referral);

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
    ///      tBTC protocol minting fee and the Depositor fee from the initial
    ///      funding transaction amount.
    ///
    ///      The tBTC protocol minting fee is calculated depending on the process
    ///      the tBTC was minted in:
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
    ///      The imbalance is left in the tBTC Depositor contract.
    ///
    ///      The Depositor fee is computed based on the `depositorFeeDivisor`
    ///      parameter. The fee is transferred to the treasury wallet on the
    ///      stake request finalization.
    /// @param depositKey Deposit key computed as
    ///                   `keccak256(fundingTxHash | fundingOutputIndex)`.
    function notifyBridgingCompleted(uint256 depositKey) public {
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.requestedAt == 0) revert StakeRequestNotInitialized();
        if (request.amountToStake > 0) revert BridgingAlreadyCompleted();

        // Get deposit details from tBTC Bridge and Vault contracts.
        IBridge.DepositRequest memory bridgeDepositRequest = bridge.deposits(
            depositKey
        );
        ITBTCVault.OptimisticMintingRequest
            memory optimisticMintingRequest = tbtcVault
                .optimisticMintingRequests(depositKey);

        // Check if Depositor revealed to the tBTC Bridge contract matches the
        // current contract address.
        // This is very unlikely scenario, that would require unexpected change or
        // bug in tBTC Bridge contract, as the depositor is set automatically
        // to the reveal deposit message sender, which will be this contract.
        // Anyway we check if the depositor that got the tBTC tokens minted
        // is this contract, before we stake them.
        if (bridgeDepositRequest.depositor != address(this))
            revert UnexpectedDepositor(bridgeDepositRequest.depositor);

        // Extract funding transaction amount sent by the user in Bitcoin transaction.
        uint256 fundingTxAmount = bridgeDepositRequest.amount;

        // Estimate tBTC protocol fees for minting.
        uint256 tbtcMintingFees = bridgeDepositRequest.treasuryFee +
            request.tbtcDepositTxMaxFee;

        // Check if deposit was optimistically minted.
        if (optimisticMintingRequest.finalizedAt > 0) {
            // For tBTC minted with optimistic minting process additional fee
            // is taken. The fee is calculated on `TBTCVault.finalizeOptimisticMint`
            // call, and not stored in the contract.
            // There is a possibility the fee has changed since the snapshot of
            // the `tbtcOptimisticMintingFeeDivisor`, to cover this scenario
            // we want to assume the bigger fee, so we use the smaller divisor.
            uint256 optimisticMintingFeeDivisor = Math.min(
                request.tbtcOptimisticMintingFeeDivisor,
                tbtcVault.optimisticMintingFeeDivisor()
            );

            uint256 optimisticMintingFee = optimisticMintingFeeDivisor > 0
                ? (fundingTxAmount / optimisticMintingFeeDivisor)
                : 0;

            tbtcMintingFees += optimisticMintingFee;
        } else {
            // If the deposit wasn't optimistically minted check if it was swept.
            if (bridgeDepositRequest.sweptAt == 0)
                revert TbtcDepositNotCompleted();
        }

        // Compute depositor fee.
        uint256 depositorFee = depositorFeeDivisor > 0
            ? (fundingTxAmount / depositorFeeDivisor)
            : 0;

        // Calculate tBTC amount available to stake after subtracting all the fees.
        // Convert amount in satoshi to tBTC token precision.
        request.amountToStake =
            (fundingTxAmount - tbtcMintingFees - depositorFee) *
            SATOSHI_MULTIPLIER;

        emit BridgingCompleted(depositKey, msg.sender, request.amountToStake);

        // Transfer depositor fee to the treasury wallet.
        if (depositorFee > 0) {
            tbtcToken.safeTransfer(acre.treasury(), depositorFee);
        }
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC minting process completed and tBTC was deposited
    ///         in this contract.
    ///         It stakes the tBTC from the given deposit into Acre, emitting the
    ///         stBTC shares to the receiver specified in the deposit extra data
    ///         and using the referral provided in the extra data.
    /// @dev This function is expected to be called after `notifyBridgingCompleted`.
    ///      In case the call to `Acre.stake` function fails (e.g. because of the
    ///      maximum deposit limit being reached), the function should be retried
    ///      after the limit is increased or other user withdraws their funds
    ///      from Acre contract to make place for another deposit.
    ///      The staker has a possibility to submit `recallStakeRequest` that
    ///      will withdraw the minted tBTC token and abort staking in Acre contract.
    /// @param depositKey Deposit key computed as
    ///                   `keccak256(fundingTxHash | fundingOutputIndex)`.
    function finalizeStakeRequest(uint256 depositKey) public {
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.amountToStake == 0) revert BridgingNotCompleted();
        if (request.finalizedAt > 0) revert StakeRequestAlreadyFinalized();

        // solhint-disable-next-line not-rely-on-time
        request.finalizedAt = uint64(block.timestamp);

        // Get deposit details from tBTC Bridge.
        IBridge.DepositRequest memory bridgeDepositRequest = bridge.deposits(
            depositKey
        );

        // Fetch receiver and referral stored in extra data in tBTC Bridge Deposit.
        // Request.
        bytes32 extraData = bridgeDepositRequest.extraData;
        (address receiver, uint16 referral) = decodeExtraData(extraData);

        emit StakeFinalized(depositKey, msg.sender);

        // Stake tBTC in Acre.
        tbtcToken.safeIncreaseAllowance(address(acre), request.amountToStake);
        acre.stake(request.amountToStake, receiver, referral);
    }

    /// @notice Recall bridged tBTC tokens from being requested to stake. This
    ///         function can be called by the staker to recover tBTC that cannot
    ///         be finalized to stake in Acre contract due to a deposit limit being
    ///         reached.
    /// @dev This function can be called only after bridging in tBTC Bridge was
    ///      completed. Only receiver provided in the extra data of the stake
    ///      request can call this function.
    /// @param depositKey Deposit key computed as
    ///                   `keccak256(fundingTxHash | fundingOutputIndex)`.
    function recallStakeRequest(uint256 depositKey) external {
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.amountToStake == 0) revert BridgingNotCompleted();
        if (request.finalizedAt > 0) revert StakeRequestAlreadyFinalized();

        // solhint-disable-next-line not-rely-on-time
        request.finalizedAt = uint64(block.timestamp);

        // Get deposit details from tBTC Bridge and Vault contracts.
        IBridge.DepositRequest memory bridgeDepositRequest = bridge.deposits(
            depositKey
        );

        // Fetch receiver and referral stored in extra data in tBTC Bridge Deposit.
        // Request.
        bytes32 extraData = bridgeDepositRequest.extraData;
        (address receiver, ) = decodeExtraData(extraData);

        // Check if caller is the receiver.
        if (msg.sender != receiver) revert CallerNotReceiver();

        emit StakeRecalled(depositKey, msg.sender);

        tbtcToken.safeTransfer(receiver, request.amountToStake);
    }

    /// @notice Updates the depositor fee divisor.
    /// @param newDepositorFeeDivisor New depositor fee divisor value.
    function updateDepositorFeeDivisor(
        uint64 newDepositorFeeDivisor
    ) external onlyOwner {
        // TODO: Introduce a parameters update process.
        depositorFeeDivisor = newDepositorFeeDivisor;

        emit DepositorFeeDivisorUpdated(newDepositorFeeDivisor);
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
