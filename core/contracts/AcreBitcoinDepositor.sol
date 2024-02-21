// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@keep-network/tbtc-v2/contracts/integrator/AbstractTBTCDepositor.sol";

import {stBTC} from "./stBTC.sol";

// TODO: Add Missfund token protection.
// TODO: Make Upgradable

/// @title Acre Bitcoin Depositor contract.
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
///         The off-chain ECDSA wallet and Optimistic Minting bots listen for these
///         sorts of messages and when they get one, they check the Bitcoin network
///         to make sure the deposit lines up. Majority of tBTC minting is finalized
///         by the Optimistic Minting process, where Minter bot initializes
///         minting process and if there is no veto from the Guardians, the
///         process is finalized and tBTC minted to the Depositor address. If
///         the revealed deposit is not handled by the Optimistic Minting process
///         the off-chain ECDSA wallet may decide to pick the deposit transaction
///         for sweeping, and when the sweep operation is confirmed on the Bitcoin
///         network, the tBTC Bridge and tBTC vault mint the tBTC token to the
///         Depositor address. After tBTC is minted to the Depositor, on the stake
///         finalization tBTC is staked in stBTC contract and stBTC shares are emitted
///         to the receiver pointed by the staker.
contract AcreBitcoinDepositor is AbstractTBTCDepositor, Ownable2Step {
    using SafeERC20 for IERC20;

    /// @notice State of the stake request.
    enum StakeRequestState {
        Unknown,
        Initialized,
        Finalized,
        Queued,
        FinalizedFromQueue,
        RecalledFromQueue
    }

    struct StakeRequest {
        // State of the stake request.
        StakeRequestState state;
        // The address to which the stBTC shares will be minted. Stored only when
        // request is queued.
        address receiver;
        // tBTC token amount to stake after deducting tBTC minting fees and the
        // Depositor fee. Stored only when request is queued.
        uint256 queuedAmount;
    }

    /// @notice tBTC Token contract.
    IERC20 public immutable tbtcToken;
    /// @notice stBTC contract.
    stBTC public immutable stbtc;

    /// @notice Mapping of stake requests.
    /// @dev The key is a deposit key identifying the deposit.
    mapping(uint256 => StakeRequest) public stakeRequests;

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
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that initialized the stake request.
    /// @param receiver The address to which the stBTC shares will be minted.
    event StakeRequestInitialized(
        uint256 indexed depositKey,
        address indexed caller,
        address indexed receiver
    );

    /// @notice Emitted when bridging completion has been notified.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that notified about bridging completion.
    /// @param referral Identifier of a partner in the referral program.
    /// @param bridgedAmount Amount of tBTC tokens that was bridged by the tBTC bridge.
    /// @param depositorFee Depositor fee amount.
    event BridgingCompleted(
        uint256 indexed depositKey,
        address indexed caller,
        uint16 indexed referral,
        uint256 bridgedAmount,
        uint256 depositorFee
    );

    /// @notice Emitted when a stake request is finalized.
    /// @dev Deposit details can be fetched from {{ ERC4626.Deposit }}
    ///      event emitted in the same transaction.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that finalized the stake request.
    /// @param stakedAmount Amount of staked tBTC tokens.
    event StakeRequestFinalized(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 stakedAmount
    );

    /// @notice Emitted when a stake request is queued.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that finalized the stake request.
    /// @param queuedAmount Amount of queued tBTC tokens.
    event StakeRequestQueued(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 queuedAmount
    );

    /// @notice Emitted when a stake request is finalized from the queue.
    /// @dev Deposit details can be fetched from {{ ERC4626.Deposit }}
    ///      event emitted in the same transaction.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that finalized the stake request.
    /// @param stakedAmount Amount of staked tBTC tokens.
    event StakeRequestFinalizedFromQueue(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 stakedAmount
    );

    /// @notice Emitted when a stake request is recalled.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param receiver Address of the receiver.
    /// @param amountToStake Amount of recalled tBTC tokens.
    event StakeRequestRecalled(
        uint256 indexed depositKey,
        address indexed receiver,
        uint256 amountToStake
    );

    /// @notice Emitted when a depositor fee divisor is updated.
    /// @param depositorFeeDivisor New value of the depositor fee divisor.
    event DepositorFeeDivisorUpdated(uint64 depositorFeeDivisor);

    /// Reverts if the tBTC Token address is zero.
    error TbtcTokenZeroAddress();

    /// Reverts if the stBTC address is zero.
    error StbtcZeroAddress();

    /// @dev Receiver address is zero.
    error ReceiverIsZeroAddress();

    /// @dev Attempted to execute function for stake request in unexpected current
    ///      state.
    error UnexpectedStakeRequestState(
        StakeRequestState currentState,
        StakeRequestState expectedState
    );

    /// @dev Attempted to notify a bridging completion, while it was already
    ///      notified.
    error BridgingCompletionAlreadyNotified();

    /// @dev Attempted to finalize a stake request, while bridging completion has
    /// not been notified yet.
    error BridgingNotCompleted();

    /// @dev Calculated depositor fee exceeds the amount of minted tBTC tokens.
    error DepositorFeeExceedsBridgedAmount(
        uint256 depositorFee,
        uint256 bridgedAmount
    );

    /// @dev Attempted to call bridging finalization for a stake request for
    ///      which the function was already called.
    error BridgingFinalizationAlreadyCalled();

    /// @dev Attempted to finalize or recall a stake request that was not added
    ///      to the queue, or was already finalized or recalled.
    error StakeRequestNotQueued();

    /// @dev Attempted to call function by an account that is not the receiver.
    error CallerNotReceiver();

    /// @notice Acre Bitcoin Depositor contract constructor.
    /// @param bridge tBTC Bridge contract instance.
    /// @param tbtcVault tBTC Vault contract instance.
    /// @param _tbtcToken tBTC token contract instance.
    /// @param _stbtc stBTC contract instance.
    // TODO: Move to initializer when making the contract upgradeable.
    constructor(
        address bridge,
        address tbtcVault,
        address _tbtcToken,
        address _stbtc
    ) Ownable(msg.sender) {
        __AbstractTBTCDepositor_initialize(bridge, tbtcVault);

        if (address(_tbtcToken) == address(0)) {
            revert TbtcTokenZeroAddress();
        }
        if (address(_stbtc) == address(0)) {
            revert StbtcZeroAddress();
        }

        tbtcToken = IERC20(_tbtcToken);
        stbtc = stBTC(_stbtc);

        depositorFeeDivisor = 1000; // 1/1000 == 10bps == 0.1% == 0.001
    }

    /// @notice This function allows staking process initialization for a Bitcoin
    ///         deposit made by an user with a P2(W)SH transaction. It uses the
    ///         supplied information to reveal a deposit to the tBTC Bridge contract.
    /// @dev Requirements:
    ///      - The revealed vault address must match the TBTCVault address,
    ///      - All requirements from {Bridge#revealDepositWithExtraData}
    ///        function must be met.
    ///      - `receiver` must be the receiver address used in the P2(W)SH BTC
    ///        deposit transaction as part of the extra data.
    ///      - `referral` must be the referral info used in the P2(W)SH BTC
    ///        deposit transaction as part of the extra data.
    ///      - BTC deposit for the given `fundingTxHash`, `fundingOutputIndex`
    ///        can be revealed only one time.
    /// @param fundingTx Bitcoin funding transaction data, see `IBridgeTypes.BitcoinTxInfo`.
    /// @param reveal Deposit reveal data, see `IBridgeTypes.DepositRevealInfo`.
    /// @param receiver The address to which the stBTC shares will be minted.
    /// @param referral Data used for referral program.
    function initializeStakeRequest(
        IBridgeTypes.BitcoinTxInfo calldata fundingTx,
        IBridgeTypes.DepositRevealInfo calldata reveal,
        address receiver,
        uint16 referral
    ) external {
        if (receiver == address(0)) revert ReceiverIsZeroAddress();

        // We don't check if the request was already initialized, as this check
        // is enforced in `_initializeDeposit` when calling the
        // `Bridge.revealDepositWithExtraData` function.

        uint256 depositKey = _initializeDeposit(
            fundingTx,
            reveal,
            encodeExtraData(receiver, referral)
        );

        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Unknown,
            StakeRequestState.Initialized
        );

        emit StakeRequestInitialized(depositKey, msg.sender, receiver);
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC bridging process was finalized.
    ///         It stakes the tBTC from the given deposit into stBTC, emitting the
    ///         stBTC shares to the receiver specified in the deposit extra data
    ///         and using the referral provided in the extra data.
    /// @dev In case depositing in stBTC vault fails (e.g. because of the
    ///      maximum deposit limit being reached), the `queueForStaking` function
    ///      should be called to add the stake request to the staking queue.
    /// @param depositKey Deposit key identifying the deposit.
    function finalizeStakeRequest(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Initialized,
            StakeRequestState.Finalized
        );

        (uint256 amountToStake, address receiver) = finalizeBridging(
            depositKey
        );

        emit StakeRequestFinalized(depositKey, msg.sender, amountToStake);

        // Deposit tBTC in stBTC.
        tbtcToken.safeIncreaseAllowance(address(stbtc), amountToStake);
        // slither-disable-next-line unused-return
        stbtc.deposit(amountToStake, receiver);
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC bridging process was finalized, in case the
    ///         `finalizeStakeRequest` failed due to stBTC vault deposit limit
    ///         being reached.
    /// @dev It queues the stake request, until the stBTC vault is ready to
    ///      accept the deposit. The request must be finalized with `stakeFromQueue`
    ///      after the limit is increased or other user withdraws their funds
    ///      from the stBTC contract to make place for another deposit.
    ///      The staker has a possibility to submit `recallFromQueue` that
    ///      will withdraw the minted tBTC token and abort staking process.
    /// @param depositKey Deposit key identifying the deposit.
    function queueForStaking(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Initialized,
            StakeRequestState.Queued
        );

        StakeRequest storage request = stakeRequests[depositKey];

        (request.queuedAmount, request.receiver) = finalizeBridging(depositKey);

        emit StakeRequestQueued(depositKey, msg.sender, request.queuedAmount);
    }

    /// @notice This function should be called for previously queued stake
    ///         request, when stBTC vault is able to accept a deposit.
    /// @param depositKey Deposit key identifying the deposit.
    function stakeFromQueue(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Queued,
            StakeRequestState.FinalizedFromQueue
        );

        StakeRequest storage request = stakeRequests[depositKey];

        if (request.queuedAmount == 0) revert StakeRequestNotQueued();

        uint256 amountToStake = request.queuedAmount;
        delete (request.queuedAmount);

        emit StakeRequestFinalizedFromQueue(
            depositKey,
            msg.sender,
            amountToStake
        );

        // Deposit tBTC in stBTC.
        tbtcToken.safeIncreaseAllowance(address(stbtc), amountToStake);
        // slither-disable-next-line unused-return
        stbtc.deposit(amountToStake, request.receiver);
    }

    /// @notice Recall bridged tBTC tokens from the staking queue. This
    ///         function can be called by the staker to recover tBTC that cannot
    ///         be finalized to stake in stBTC contract due to a deposit limit being
    ///         reached.
    /// @dev This function can be called only after the stake request was added
    ///      to queue.
    /// @dev Only receiver provided in the extra data of the stake request can
    ///      call this function.
    /// @param depositKey Deposit key identifying the deposit.
    function recallFromQueue(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Queued,
            StakeRequestState.RecalledFromQueue
        );

        StakeRequest storage request = stakeRequests[depositKey];

        if (request.queuedAmount == 0) revert StakeRequestNotQueued();

        // Check if caller is the receiver.
        if (msg.sender != request.receiver) revert CallerNotReceiver();

        uint256 amount = request.queuedAmount;
        delete (request.queuedAmount);

        emit StakeRequestRecalled(depositKey, request.receiver, amount);

        tbtcToken.safeTransfer(request.receiver, amount);
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

    // TODO: Handle minimum deposit amount in tBTC Bridge vs stBTC.

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

    /// @notice This function is used for state transitions. It ensures the current
    ///         stakte matches expected, and updates the stake request to a new
    ///         state.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param expectedState Expected current stake request state.
    /// @param newState New stake request state.
    function transitionStakeRequestState(
        uint256 depositKey,
        StakeRequestState expectedState,
        StakeRequestState newState
    ) internal {
        // Validate current stake request state.
        if (stakeRequests[depositKey].state != expectedState)
            revert UnexpectedStakeRequestState(
                stakeRequests[depositKey].state,
                expectedState
            );

        // Transition to a new state.
        stakeRequests[depositKey].state = newState;
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC minting process completed, meaning tBTC was
    ///         minted to this contract.
    /// @dev It calculates the amount to stake based on the approximate minted
    ///      tBTC amount reduced by the depositor fee.
    /// @dev IMPORTANT NOTE: The minted tBTC amount used by this function is an
    ///      approximation. See documentation of the
    ///      {{TBTCDepositorProxy#_calculateTbtcAmount}} responsible for calculating
    ///      this value for more details.
    /// @param depositKey Deposit key identifying the deposit.
    /// @return amountToStake tBTC token amount to stake after deducting tBTC bridging
    ///         fees and the depositor fee.
    /// @return receiver The address to which the stBTC shares will be minted.
    function finalizeBridging(
        uint256 depositKey
    ) internal returns (uint256, address) {
        (
            uint256 initialDepositAmount,
            uint256 tbtcAmount,
            bytes32 extraData
        ) = _finalizeDeposit(depositKey);

        (address receiver, uint16 referral) = decodeExtraData(extraData);

        // Compute depositor fee. The fee is calculated based on the initial funding
        // transaction amount, before the tBTC protocol network fees were taken.
        uint256 depositorFee = depositorFeeDivisor > 0
            ? (initialDepositAmount / depositorFeeDivisor)
            : 0;

        // Ensure the depositor fee does not exceed the approximate minted tBTC
        // amount.
        if (depositorFee >= tbtcAmount) {
            revert DepositorFeeExceedsBridgedAmount(depositorFee, tbtcAmount);
        }

        uint256 amountToStake = tbtcAmount - depositorFee;

        emit BridgingCompleted(
            depositKey,
            msg.sender,
            referral,
            tbtcAmount,
            depositorFee
        );

        // Transfer depositor fee to the treasury wallet.
        if (depositorFee > 0) {
            tbtcToken.safeTransfer(stbtc.treasury(), depositorFee);
        }

        return (amountToStake, receiver);
    }
}
