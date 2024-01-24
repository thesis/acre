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

contract TbtcDepositorStub is Ownable {
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

    /// @notice Emitted when a stake request is finalized.
    /// @dev Deposit details can be fetched from {{ ERC4626.Deposit }}
    ///      event emitted in the same transaction.
    /// @param depositKey Deposit identifier.
    /// @param caller Address that finalized the stake request.
    event StakeFinalized(uint256 indexed depositKey, address indexed caller);

    /// @notice Emitted when a depositor fee divisor is updated.
    /// @param depositorFeeDivisor New value of the depositor fee divisor.
    event DepositorFeeDivisorUpdated(uint64 depositorFeeDivisor);

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

    constructor(
        IBridge _bridge,
        ITBTCVault _tbtcVault,
        Acre _acre
    ) Ownable(msg.sender) {
        bridge = _bridge;
        tbtcVault = _tbtcVault;
        acre = _acre;

        depositorFeeDivisor = 0; // Depositor fee is disabled initially.
    }

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

        uint256 depositKey = calculateDepositKey(
            fundingTxHash,
            reveal.fundingOutputIndex
        );
        StakeRequest storage request = stakeRequests[depositKey];

        if (request.requestedAt > 0) revert StakeRequestAlreadyInProgress();

        emit StakeInitialized(depositKey, msg.sender, receiver, referral);

        // solhint-disable-next-line not-rely-on-time
        request.requestedAt = uint64(block.timestamp);

        // // Reveal the deposit to tBTC Bridge contract.
        // bridge.revealDepositWithExtraData(
        //     fundingTx,
        //     reveal,
        //     encodeExtraData(receiver, referral)
        // );

        // Snapshot parameters required for fee calculation.
        // (, , request.tbtcDepositTxMaxFee, ) = bridge.depositParameters();
        // request.tbtcOptimisticMintingFeeDivisor = tbtcVault
        //     .optimisticMintingFeeDivisor();
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
}
