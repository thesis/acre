// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "@keep-network/tbtc-v2/contracts/integrator/AbstractTBTCDepositor.sol";

import {stBTC} from "../../stBTC.sol";

/// @title AcreBitcoinDepositorV2
/// @dev This is a contract used to test Acre Bitcoin Depositor upgradeability.
///      It is a copy of AcreBitcoinDepositor contract with some differences
///      marked with `TEST:` comments.
contract AcreBitcoinDepositorV2 is
    AbstractTBTCDepositor,
    Ownable2StepUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice State of the stake request.
    enum StakeRequestState {
        Unknown,
        Initialized,
        Finalized
    }

    /// @notice Mapping of stake requests.
    /// @dev The key is a deposit key identifying the deposit.
    mapping(uint256 => StakeRequestState) public stakeRequests;

    /// @notice tBTC Token contract.
    IERC20 public tbtcToken;

    /// @notice stBTC contract.
    stBTC public stbtc;

    /// @notice Minimum amount of a single stake request (in tBTC token precision).
    /// @dev This parameter should be set to a value exceeding the minimum deposit
    ///      amount supported by tBTC Bridge.
    uint256 public minStakeAmount;

    /// @notice Divisor used to compute the depositor fee taken from each deposit
    ///         and transferred to the treasury upon stake request finalization.
    /// @dev That fee is computed as follows:
    ///      `depositorFee = depositedAmount / depositorFeeDivisor`
    ///       for example, if the depositor fee needs to be 2% of each deposit,
    ///       the `depositorFeeDivisor` should be set to `50` because
    ///       `1/50 = 0.02 = 2%`.
    uint64 public depositorFeeDivisor;

    // TEST: New variable;
    uint256 public newVariable;

    /// @notice Emitted when a stake request is initialized.
    /// @dev Deposit details can be fetched from {{ Bridge.DepositRevealed }}
    ///      event emitted in the same transaction.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that initialized the stake request.
    /// @param staker The address to which the stBTC shares will be minted.
    /// @param initialAmount Amount of funding transaction.
    event StakeRequestInitialized(
        uint256 indexed depositKey,
        address indexed caller,
        address indexed staker,
        uint256 initialAmount
    );

    /// @notice Emitted when a stake request is finalized.
    /// @dev Deposit details can be fetched from {{ ERC4626.Deposit }}
    ///      event emitted in the same transaction.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that finalized the stake request.
    /// @param initialAmount Amount of funding transaction.
    /// @param bridgedAmount Amount of tBTC tokens that was bridged by the tBTC bridge.
    /// @param depositorFee Depositor fee amount.
    event StakeRequestFinalized(
        uint256 indexed depositKey,
        address indexed caller,
        uint16 indexed referral,
        uint256 initialAmount,
        uint256 bridgedAmount,
        uint256 depositorFee
    );

    /// @notice Emitted when a minimum single stake amount is updated.
    /// @param minStakeAmount New value of the minimum single stake
    ///        amount (in tBTC token precision).
    event MinStakeAmountUpdated(uint256 minStakeAmount);

    /// @notice Emitted when a depositor fee divisor is updated.
    /// @param depositorFeeDivisor New value of the depositor fee divisor.
    event DepositorFeeDivisorUpdated(uint64 depositorFeeDivisor);

    // TEST: New event;
    event NewEvent();

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

    /// @dev Calculated depositor fee exceeds the amount of minted tBTC tokens.
    error DepositorFeeExceedsBridgedAmount(
        uint256 depositorFee,
        uint256 bridgedAmount
    );

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

    function initialize(IERC20 asset, address _treasury) public initializer {
        // TEST: Removed content of initialize function. Initialize shouldn't be
        //       called again during the upgrade because of the `initializer`
        //       modifier.
    }

    function initializeV2(uint256 _newVariable) public reinitializer(2) {
        newVariable = _newVariable;
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
        (uint256 depositKey, uint256 initialAmount) = _initializeDeposit(
            fundingTx,
            reveal,
            encodeExtraData(staker, referral)
        );

        // Validate current stake request state.
        if (stakeRequests[depositKey] != StakeRequestState.Unknown)
            revert UnexpectedStakeRequestState(
                stakeRequests[depositKey],
                StakeRequestState.Unknown
            );

        // Transition to a new state.
        stakeRequests[depositKey] = StakeRequestState.Initialized;

        emit StakeRequestInitialized(
            depositKey,
            msg.sender,
            staker,
            initialAmount
        );
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
    /// @param depositKey Deposit key identifying the deposit.
    function finalizeStake(uint256 depositKey) external {
        // Validate current stake request state.
        if (stakeRequests[depositKey] != StakeRequestState.Initialized)
            revert UnexpectedStakeRequestState(
                stakeRequests[depositKey],
                StakeRequestState.Initialized
            );

        // Transition to a new state.
        stakeRequests[depositKey] = StakeRequestState.Finalized;

        (
            uint256 initialAmount,
            uint256 tbtcAmount,
            bytes32 extraData
        ) = _finalizeDeposit(depositKey);

        // Compute depositor fee. The fee is calculated based on the initial funding
        // transaction amount, before the tBTC protocol network fees were taken.
        uint256 depositorFee = depositorFeeDivisor > 0
            ? (initialAmount / depositorFeeDivisor)
            : 0;

        // Ensure the depositor fee does not exceed the approximate minted tBTC
        // amount.
        if (depositorFee >= tbtcAmount) {
            revert DepositorFeeExceedsBridgedAmount(depositorFee, tbtcAmount);
        }

        // Transfer depositor fee to the treasury wallet.
        if (depositorFee > 0) {
            tbtcToken.safeTransfer(stbtc.treasury(), depositorFee);
        }

        (address staker, uint16 referral) = decodeExtraData(extraData);

        emit StakeRequestFinalized(
            depositKey,
            msg.sender,
            referral,
            initialAmount,
            tbtcAmount,
            depositorFee
        );

        uint256 amountToStake = tbtcAmount - depositorFee;

        // Deposit tBTC in stBTC.
        tbtcToken.safeIncreaseAllowance(address(stbtc), amountToStake);
        // slither-disable-next-line unused-return
        stbtc.deposit(amountToStake, staker);
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

        // TEST: Emit newly added event.
        emit NewEvent();
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
}
