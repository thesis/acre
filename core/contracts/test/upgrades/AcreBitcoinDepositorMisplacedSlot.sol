// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "@keep-network/tbtc-v2/contracts/integrator/AbstractTBTCDepositor.sol";

import {stBTC} from "../../stBTC.sol";

/// @title AcreBitcoinDepositorMisplacedSlot
/// @dev This is a contract used to test Acre Bitcoin Depositor upgradeability.
///      It is a copy of AcreBitcoinDepositor contract with some differences
///      marked with `TEST:` comments.
contract AcreBitcoinDepositorMisplacedSlot is
    AbstractTBTCDepositor,
    Ownable2StepUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice State of the stake request.
    enum StakeRequestState {
        Unknown,
        Initialized,
        Finalized,
        Queued,
        FinalizedFromQueue,
        CancelledFromQueue
    }

    struct StakeRequest {
        // State of the stake request.
        StakeRequestState state;
        // The address to which the stBTC shares will be minted. Stored only when
        // request is queued.
        address staker;
        // tBTC token amount to stake after deducting tBTC minting fees and the
        // Depositor fee. Stored only when request is queued.
        uint88 queuedAmount;
    }

    /// TEST: New state variable - misplaced slot to test upgradeability.
    string public newVariable;

    /// @notice Mapping of stake requests.
    /// @dev The key is a deposit key identifying the deposit.
    mapping(uint256 => StakeRequest) public stakeRequests;

    /// @notice tBTC Token contract.
    // TODO: Remove slither disable when introducing upgradeability.
    // slither-disable-next-line immutable-states
    IERC20 public tbtcToken;

    /// @notice stBTC contract.
    // TODO: Remove slither disable when introducing upgradeability.
    // slither-disable-next-line immutable-states
    stBTC public stbtc;

    /// @notice Minimum amount of a single stake request (in tBTC token precision).
    /// @dev This parameter should be set to a value exceeding the minimum deposit
    ///      amount supported by tBTC Bridge.
    uint256 public minStakeAmount;

    /// @notice Maximum amount of a single stake request (in tBTC token precision).
    /// @dev The staking flow in the dApp is asynchronous and there is a short period
    ///      of time between a deposit funding transaction is made on Bitcoin chain
    ///      and revealed to this contract. This limit is used to gain better control
    ///      on the stakes queue, and reduce a risk of concurrent stake requests
    ///      made in the dApp being blocked by another big deposit.
    uint256 public maxSingleStakeAmount;

    /// @notice Maximum total assets soft limit (in tBTC token precision).
    /// @dev stBTC contract defines a maximum total assets limit held by the protocol
    ///      that new deposits cannot exceed (hard cap). Due to the asynchronous
    ///      manner of Bitcoin deposits process we introduce a soft limit (soft cap)
    ///      set to a value lower than the hard cap to let the dApp initialize
    ///      Bitcoin deposits only up to the soft cap limit.
    uint256 public maxTotalAssetsSoftLimit;

    /// @notice Total balance of pending stake requests (in tBTC token precision).
    /// @dev stBTC contract introduces limits for total deposits amount. Due to
    ///      asynchronous manner of the staking flow, this contract needs to track
    ///      balance of pending stake requests to ensure new stake request are
    ///      not initialized if they won't be able to finalize.
    uint256 public queuedStakesBalance;

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
    /// @param staker The address to which the stBTC shares will be minted.
    event StakeRequestInitialized(
        uint256 indexed depositKey,
        address indexed caller,
        address indexed staker
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

    /// @notice Emitted when a queued stake request is cancelled.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param staker Address of the staker.
    /// @param amountCancelled Amount of queued tBTC tokens that got cancelled.
    event StakeRequestCancelledFromQueue(
        uint256 indexed depositKey,
        address indexed staker,
        uint256 amountCancelled
    );

    /// @notice Emitted when a minimum single stake amount is updated.
    /// @param minStakeAmount New value of the minimum single stake
    ///        amount (in tBTC token precision).
    event MinStakeAmountUpdated(uint256 minStakeAmount);

    /// @notice Emitted when a maximum single stake amount is updated.
    /// @param maxSingleStakeAmount New value of the maximum single stake
    ///        amount (in tBTC token precision).
    event MaxSingleStakeAmountUpdated(uint256 maxSingleStakeAmount);

    /// @notice Emitted when a maximum total assets soft limit is updated.
    /// @param maxTotalAssetsSoftLimit New value of the maximum total assets
    ///        soft limit (in tBTC token precision).
    event MaxTotalAssetsSoftLimitUpdated(uint256 maxTotalAssetsSoftLimit);

    /// @notice Emitted when a depositor fee divisor is updated.
    /// @param depositorFeeDivisor New value of the depositor fee divisor.
    event DepositorFeeDivisorUpdated(uint64 depositorFeeDivisor);

    /// Reverts if the tBTC Token address is zero.
    error TbtcTokenZeroAddress();

    /// Reverts if the stBTC address is zero.
    error StbtcZeroAddress();

    /// @dev Staker address is zero.
    error StakerIsZeroAddress();

    /// @dev Attempted to execute function for stake request in unexpected current
    ///      state.
    error UnexpectedStakeRequestState(
        StakeRequestState currentState,
        StakeRequestState expectedState
    );

    /// @dev Attempted to initialize a stake request with a deposit amount
    ///      exceeding the maximum limit for a single stake amount.
    error ExceededMaxSingleStake(uint256 amount, uint256 max);

    /// @dev Attempted to finalize bridging with depositor's contract tBTC balance
    ///      lower than the calculated bridged tBTC amount. This error means
    ///      that Governance should top-up the tBTC reserve for bridging fees
    ///      approximation.
    error InsufficientTbtcBalance(
        uint256 amountToStake,
        uint256 currentBalance
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

    /// @dev Attempted to finalize or cancel a stake request that was not added
    ///      to the queue, or was already finalized or cancelled.
    error StakeRequestNotQueued();

    /// @dev Attempted to call function by an account that is not the staker.
    error CallerNotStaker();

    /// @dev Attempted to set minimum stake amount to a value lower than the
    ///      tBTC Bridge deposit dust threshold.
    error MinStakeAmountLowerThanBridgeMinDeposit(
        uint256 minStakeAmount,
        uint256 bridgeMinDepositAmount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Acre Bitcoin Depositor contract initializer.
    /// @param bridge tBTC Bridge contract instance.
    /// @param tbtcVault tBTC Vault contract instance.
    /// @param _tbtcToken tBTC token contract instance.
    /// @param _stbtc stBTC contract instance.
    function initialize(
        address bridge,
        address tbtcVault,
        address _tbtcToken,
        address _stbtc
    ) public initializer {
        __AbstractTBTCDepositor_initialize(bridge, tbtcVault);
        __Ownable2Step_init();
        __Ownable_init(msg.sender);

        if (address(_tbtcToken) == address(0)) {
            revert TbtcTokenZeroAddress();
        }
        if (address(_stbtc) == address(0)) {
            revert StbtcZeroAddress();
        }

        tbtcToken = IERC20(_tbtcToken);
        stbtc = stBTC(_stbtc);

        // TODO: Revisit initial values before mainnet deployment.
        minStakeAmount = 0.015 * 1e18; // 0.015 BTC
        maxSingleStakeAmount = 0.5 * 1e18; // 0.5 BTC
        maxTotalAssetsSoftLimit = 7 * 1e18; // 7 BTC
        depositorFeeDivisor = 1000; // 1/1000 == 10bps == 0.1% == 0.001
    }

    /// @notice This function allows staking process initialization for a Bitcoin
    ///         deposit made by an user with a P2(W)SH transaction. It uses the
    ///         supplied information to reveal a deposit to the tBTC Bridge contract.
    /// @dev Requirements:
    ///      - The revealed vault address must match the TBTCVault address,
    ///      - All requirements from {Bridge#revealDepositWithExtraData}
    ///        function must be met.
    ///      - `staker` must be the staker address used in the P2(W)SH BTC
    ///        deposit transaction as part of the extra data.
    ///      - `referral` must be the referral info used in the P2(W)SH BTC
    ///        deposit transaction as part of the extra data.
    ///      - BTC deposit for the given `fundingTxHash`, `fundingOutputIndex`
    ///        can be revealed only one time.
    /// @param fundingTx Bitcoin funding transaction data, see `IBridgeTypes.BitcoinTxInfo`.
    /// @param reveal Deposit reveal data, see `IBridgeTypes.DepositRevealInfo`.
    /// @param staker The address to which the stBTC shares will be minted.
    /// @param referral Data used for referral program.
    function initializeStake(
        IBridgeTypes.BitcoinTxInfo calldata fundingTx,
        IBridgeTypes.DepositRevealInfo calldata reveal,
        address staker,
        uint16 referral
    ) external {
        if (staker == address(0)) revert StakerIsZeroAddress();

        // We don't check if the request was already initialized, as this check
        // is enforced in `_initializeDeposit` when calling the
        // `Bridge.revealDepositWithExtraData` function.
        (uint256 depositKey, uint256 initialDepositAmount) = _initializeDeposit(
            fundingTx,
            reveal,
            encodeExtraData(staker, referral)
        );

        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Unknown,
            StakeRequestState.Initialized
        );

        if (initialDepositAmount > maxSingleStakeAmount)
            revert ExceededMaxSingleStake(
                initialDepositAmount,
                maxSingleStakeAmount
            );

        emit StakeRequestInitialized(depositKey, msg.sender, staker);
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC bridging process was finalized.
    ///         It stakes the tBTC from the given deposit into stBTC, emitting the
    ///         stBTC shares to the staker specified in the deposit extra data
    ///         and using the referral provided in the extra data.
    /// @dev In case depositing in stBTC vault fails (e.g. because of the
    ///      maximum deposit limit being reached), the `queueStake` function
    ///      should be called to add the stake request to the staking queue.
    /// @param depositKey Deposit key identifying the deposit.
    function finalizeStake(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Initialized,
            StakeRequestState.Finalized
        );

        (uint256 amountToStake, address staker) = finalizeBridging(depositKey);

        emit StakeRequestFinalized(depositKey, msg.sender, amountToStake);

        // Deposit tBTC in stBTC.
        tbtcToken.safeIncreaseAllowance(address(stbtc), amountToStake);
        // slither-disable-next-line unused-return
        stbtc.deposit(amountToStake, staker);
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC bridging process was finalized, in case the
    ///         `finalizeStake` failed due to stBTC vault deposit limit
    ///         being reached.
    /// @dev It queues the stake request, until the stBTC vault is ready to
    ///      accept the deposit. The request must be finalized with `finalizeQueuedStake`
    ///      after the limit is increased or other user withdraws their funds
    ///      from the stBTC contract to make place for another deposit.
    ///      The staker has a possibility to submit `cancelQueuedStake` that
    ///      will withdraw the minted tBTC token and abort staking process.
    /// @param depositKey Deposit key identifying the deposit.
    function queueStake(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Initialized,
            StakeRequestState.Queued
        );

        StakeRequest storage request = stakeRequests[depositKey];

        uint256 amountToQueue;
        (amountToQueue, request.staker) = finalizeBridging(depositKey);

        request.queuedAmount = SafeCast.toUint88(amountToQueue);

        // Increase pending stakes balance.
        queuedStakesBalance += amountToQueue;

        emit StakeRequestQueued(depositKey, msg.sender, amountToQueue);
    }

    /// @notice This function should be called for previously queued stake
    ///         request, when stBTC vault is able to accept a deposit.
    /// @param depositKey Deposit key identifying the deposit.
    function finalizeQueuedStake(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Queued,
            StakeRequestState.FinalizedFromQueue
        );

        StakeRequest storage request = stakeRequests[depositKey];

        if (request.queuedAmount == 0) revert StakeRequestNotQueued();

        uint256 amountToStake = request.queuedAmount;
        delete (request.queuedAmount);

        // Decrease pending stakes balance.
        queuedStakesBalance -= amountToStake;

        emit StakeRequestFinalizedFromQueue(
            depositKey,
            msg.sender,
            amountToStake
        );

        // Deposit tBTC in stBTC.
        tbtcToken.safeIncreaseAllowance(address(stbtc), amountToStake);
        // slither-disable-next-line unused-return
        stbtc.deposit(amountToStake, request.staker);
    }

    /// @notice Cancel queued stake.
    ///         The function can be called by the staker to recover tBTC that cannot
    ///         be finalized to stake in stBTC contract due to a deposit limit being
    ///         reached.
    /// @dev This function can be called only after the stake request was added
    ///      to queue.
    /// @dev Only staker provided in the extra data of the stake request can
    ///      call this function.
    /// @param depositKey Deposit key identifying the deposit.
    function cancelQueuedStake(uint256 depositKey) external {
        transitionStakeRequestState(
            depositKey,
            StakeRequestState.Queued,
            StakeRequestState.CancelledFromQueue
        );

        StakeRequest storage request = stakeRequests[depositKey];

        uint256 amount = request.queuedAmount;
        if (amount == 0) revert StakeRequestNotQueued();

        address staker = request.staker;
        // Check if caller is the staker.
        if (msg.sender != staker) revert CallerNotStaker();

        delete (request.queuedAmount);

        emit StakeRequestCancelledFromQueue(depositKey, staker, amount);

        // Decrease pending stakes balance.
        queuedStakesBalance -= amount;

        tbtcToken.safeTransfer(staker, amount);
    }

    /// @notice Updates the minimum stake amount.
    /// @dev It requires that the new value is greater or equal to the tBTC Bridge
    ///      deposit dust threshold, to ensure deposit will be able to be bridged.
    /// @param newMinStakeAmount New minimum stake amount (in tBTC precision).
    function updateMinStakeAmount(
        uint256 newMinStakeAmount
    ) external onlyOwner {
        uint256 minBridgeDepositAmount = _minDepositAmount();

        // Check if new value is at least equal the tBTC Bridge Deposit Dust Threshold.
        if (newMinStakeAmount < minBridgeDepositAmount)
            revert MinStakeAmountLowerThanBridgeMinDeposit(
                newMinStakeAmount,
                minBridgeDepositAmount
            );

        minStakeAmount = newMinStakeAmount;

        emit MinStakeAmountUpdated(newMinStakeAmount);
    }

    /// @notice Updates the maximum single stake amount.
    /// @param newMaxSingleStakeAmount New maximum single stake amount (in tBTC
    ///        precision).
    function updateMaxSingleStakeAmount(
        uint256 newMaxSingleStakeAmount
    ) external onlyOwner {
        maxSingleStakeAmount = newMaxSingleStakeAmount;

        emit MaxSingleStakeAmountUpdated(newMaxSingleStakeAmount);
    }

    /// @notice Updates the maximum total assets soft limit.
    /// @param newMaxTotalAssetsSoftLimit New maximum total assets soft limit
    ///        (in tBTC precision).
    function updateMaxTotalAssetsSoftLimit(
        uint256 newMaxTotalAssetsSoftLimit
    ) external onlyOwner {
        maxTotalAssetsSoftLimit = newMaxTotalAssetsSoftLimit;

        emit MaxTotalAssetsSoftLimitUpdated(newMaxTotalAssetsSoftLimit);
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

    /// @notice Minimum stake amount (in tBTC token precision).
    /// @dev This function should be used by dApp to check the minimum amount
    ///      for the stake request.
    /// @dev It is not enforced in the `initializeStakeRequest` function, as
    ///      it is intended to be used in the dApp staking form.
    function minStake() external view returns (uint256) {
        return minStakeAmount;
    }

    /// @notice Maximum stake amount (in tBTC token precision).
    /// @dev It takes into consideration the maximum total assets soft limit (soft
    ///      cap), that is expected to be set below the stBTC maximum total assets
    ///      limit (hard cap).
    /// @dev This function should be called before Bitcoin transaction funding
    ///      is made. The `initializeStakeRequest` function is not enforcing this
    ///      limit, not to block the reveal deposit operation of the concurrent
    ///      deposits made in the dApp in the short window between limit check,
    ///      submission of Bitcoin funding transaction and stake request
    ///      initialization.
    /// @return Maximum allowed stake amount.
    function maxStake() external view returns (uint256) {
        uint256 currentTotalAssets = stbtc.totalAssets();

        if (currentTotalAssets >= maxTotalAssetsSoftLimit) {
            return 0;
        }

        uint256 availableLimit = maxTotalAssetsSoftLimit - currentTotalAssets;

        if (queuedStakesBalance >= availableLimit) {
            return 0;
        }
        availableLimit -= queuedStakesBalance;

        return Math.min(availableLimit, maxSingleStakeAmount);
    }

    // TODO: Handle minimum deposit amount in tBTC Bridge vs stBTC.

    /// @notice Encodes staker address and referral as extra data.
    /// @dev Packs the data to bytes32: 20 bytes of staker address and
    ///      2 bytes of referral, 10 bytes of trailing zeros.
    /// @param staker The address to which the stBTC shares will be minted.
    /// @param referral Data used for referral program.
    /// @return Encoded extra data.
    function encodeExtraData(
        address staker,
        uint16 referral
    ) public pure returns (bytes32) {
        return bytes32(abi.encodePacked(staker, referral));
    }

    /// @notice Decodes staker address and referral from extra data.
    /// @dev Unpacks the data from bytes32: 20 bytes of staker address and
    ///      2 bytes of referral, 10 bytes of trailing zeros.
    /// @param extraData Encoded extra data.
    /// @return staker The address to which the stBTC shares will be minted.
    /// @return referral Data used for referral program.
    function decodeExtraData(
        bytes32 extraData
    ) public pure returns (address staker, uint16 referral) {
        // First 20 bytes of extra data is staker address.
        staker = address(uint160(bytes20(extraData)));
        // Next 2 bytes of extra data is referral info.
        referral = uint16(bytes2(extraData << (8 * 20)));
    }

    /// @notice This function is used for state transitions. It ensures the current
    ///         state matches expected, and updates the stake request to a new
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
    ///      {{AbstractTBTCDepositor#_calculateTbtcAmount}} responsible for calculating
    ///      this value for more details.
    /// @dev In case balance of tBTC tokens in this contract doesn't meet the
    ///      calculated tBTC amount, the function reverts with `InsufficientTbtcBalance`
    ///      error. This case requires Governance's validation, as tBTC Bridge minting
    ///      fees might changed in the way that reserve mentioned in
    ///      {{AbstractTBTCDepositor#_calculateTbtcAmount}} needs a top-up.
    /// @param depositKey Deposit key identifying the deposit.
    /// @return amountToStake tBTC token amount to stake after deducting tBTC bridging
    ///         fees and the depositor fee.
    /// @return staker The address to which the stBTC shares will be minted.
    function finalizeBridging(
        uint256 depositKey
    ) internal returns (uint256, address) {
        (
            uint256 initialDepositAmount,
            uint256 tbtcAmount,
            bytes32 extraData
        ) = _finalizeDeposit(depositKey);

        // Check if current balance is sufficient to finalize bridging of `tbtcAmount`.
        uint256 currentBalance = tbtcToken.balanceOf(address(this));
        if (tbtcAmount > tbtcToken.balanceOf(address(this))) {
            revert InsufficientTbtcBalance(tbtcAmount, currentBalance);
        }

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

        (address staker, uint16 referral) = decodeExtraData(extraData);

        // Emit event for accounting purposes to track partner's referral ID and
        // depositor fee taken.
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

        return (amountToStake, staker);
    }
}
