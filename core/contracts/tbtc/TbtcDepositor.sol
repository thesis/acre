// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {BTCUtils} from "@keep-network/bitcoin-spv-sol/contracts/BTCUtils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import "@keep-network/tbtc-v2/contracts/integrator/TBTCDepositorProxy.sol";

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
contract TbtcDepositor is TBTCDepositorProxy, Ownable {
    using BTCUtils for bytes;
    using SafeERC20 for IERC20;

    struct StakeRequest {
        // Timestamp at which the deposit request was initialized is not stored
        // in this structure, as it is available under `Bridge.DepositRequest.revealedAt`.

        // UNIX timestamp at which the deposit request was finalized.
        // 0 if not yet finalized.
        uint64 finalizedAt;
        // The address to which the stBTC shares will be minted.
        address receiver;
        // Identifier of a partner in the referral program.
        uint16 referral;
        // tBTC token amount to stake after deducting tBTC minting fees and the
        // Depositor fee.
        uint256 amountToStake;
    }

    /// @notice tBTC Token contract.
    IERC20 public immutable tbtcToken;
    /// @notice Acre contract.
    Acre public acre;

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
    /// @param amountToStake Amount of staked tBTC tokens.
    event StakeRequestFinalized(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 amountToStake
    );

    /// @notice Emitted when a stake request is recalled.
    /// @param depositKey Deposit key identifying the deposit.
    /// @param caller Address that called the function to recall the stake.
    /// @param amountToStake Amount of recalled tBTC tokens.
    event StakeRequestRecalled(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 amountToStake
    );

    /// @notice Emitted when a depositor fee divisor is updated.
    /// @param depositorFeeDivisor New value of the depositor fee divisor.
    event DepositorFeeDivisorUpdated(uint64 depositorFeeDivisor);

    /// @dev Receiver address is zero.
    error ReceiverIsZeroAddress();

    /// @dev Attempted to finalize a stake request, while bridging completion has
    /// not been notified yet.
    error BridgingNotCompleted();

    /// @dev Calculated depositor fee exceeds the amount of minted tBTC tokens.
    error DepositorFeeExceedsBridgedAmount(
        uint256 depositorFee,
        uint256 bridgedAmount
    );

    /// @dev Attempted to finalize a stake request that was already finalized.
    error StakeRequestAlreadyFinalized();

    /// @dev Attempted to call function by an account that is not the receiver.
    error CallerNotReceiver();

    /// @notice Tbtc Depositor contract constructor.
    /// @param _bridge tBTC Bridge contract instance.
    /// @param _tbtcVault tBTC Vault contract instance.
    /// @param _acre Acre contract instance.
    // TODO: Move to initializer when making the contract upgradeable.
    constructor(
        address _bridge,
        address _tbtcVault,
        address _tbtcToken,
        address _acre
    ) Ownable(msg.sender) {
        __TBTCDepositorProxy_initialize(_bridge, _tbtcVault);

        require(_tbtcToken != address(0), "TBTCToken address cannot be zero");
        require(_acre != address(0), "Acre address cannot be zero");

        tbtcToken = IERC20(_tbtcToken);
        acre = Acre(_acre);

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

        StakeRequest storage request = stakeRequests[depositKey];
        request.receiver = receiver;
        request.referral = referral;

        emit StakeRequestInitialized(depositKey, msg.sender, receiver);
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
    function notifyBridgingCompleted(uint256 depositKey) external {
        (
            uint256 depositAmount,
            uint256 depositSubBridgingFeesAmount,

        ) = _finalizeDeposit(depositKey);

        // Compute depositor fee. The fee is calculated based on the initial funding
        // transaction amount, before the tBTC protocol network fees were taken.
        uint256 depositorFee = depositorFeeDivisor > 0
            ? (depositAmount / depositorFeeDivisor)
            : 0;

        // Ensure the depositor fee does not exceed the approximate minted tBTC
        // amount.
        if (depositorFee >= depositSubBridgingFeesAmount) {
            revert DepositorFeeExceedsBridgedAmount(
                depositorFee,
                depositSubBridgingFeesAmount
            );
        }

        StakeRequest storage request = stakeRequests[depositKey];

        request.amountToStake = depositSubBridgingFeesAmount - depositorFee;

        emit BridgingCompleted(
            depositKey,
            msg.sender,
            request.referral,
            depositSubBridgingFeesAmount,
            depositorFee
        );

        // Transfer depositor fee to the treasury wallet.
        if (depositorFee > 0) {
            tbtcToken.safeTransfer(acre.treasury(), depositorFee);
        }
    }

    /// @notice This function should be called for previously initialized stake
    ///         request, after tBTC bridging process was finalized.
    ///         It stakes the tBTC from the given deposit into Acre, emitting the
    ///         stBTC shares to the receiver specified in the deposit extra data
    ///         and using the referral provided in the extra data.
    /// @dev This function is expected to be called after `notifyBridgingCompleted`.
    ///      In case depositing in stBTC vault fails (e.g. because of the
    ///      maximum deposit limit being reached), the function should be retried
    ///      after the limit is increased or other user withdraws their funds
    ///      from the stBTC contract to make place for another deposit.
    ///      The staker has a possibility to submit `recallStakeRequest` that
    ///      will withdraw the minted tBTC token and abort staking process.
    /// @param depositKey Deposit key identifying the deposit.
    function finalizeStakeRequest(uint256 depositKey) external {
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.amountToStake == 0) revert BridgingNotCompleted();
        if (request.finalizedAt > 0) revert StakeRequestAlreadyFinalized();

        // solhint-disable-next-line not-rely-on-time
        request.finalizedAt = uint64(block.timestamp);

        emit StakeRequestFinalized(
            depositKey,
            msg.sender,
            request.amountToStake
        );

        // Stake tBTC in Acre.
        tbtcToken.safeIncreaseAllowance(address(acre), request.amountToStake);
        acre.deposit(request.amountToStake, request.receiver);
    }

    /// @notice Recall bridged tBTC tokens from being requested to stake. This
    ///         function can be called by the staker to recover tBTC that cannot
    ///         be finalized to stake in Acre contract due to a deposit limit being
    ///         reached.
    /// @dev This function can be called only after bridging in tBTC Bridge was
    ///      completed. Only receiver provided in the extra data of the stake
    ///      request can call this function.
    /// @param depositKey Deposit key identifying the deposit.
    function recallStakeRequest(uint256 depositKey) external {
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.amountToStake == 0) revert BridgingNotCompleted();
        if (request.finalizedAt > 0) revert StakeRequestAlreadyFinalized();

        // Check if caller is the receiver.
        if (msg.sender != request.receiver) revert CallerNotReceiver();

        // solhint-disable-next-line not-rely-on-time
        request.finalizedAt = uint64(block.timestamp);

        emit StakeRequestRecalled(
            depositKey,
            msg.sender,
            request.amountToStake
        );

        tbtcToken.safeTransfer(request.receiver, request.amountToStake);
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
}
