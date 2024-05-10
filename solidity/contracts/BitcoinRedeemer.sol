// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

import "@thesis-co/solidity-contracts/contracts/token/IReceiveApproval.sol";

import "./stBTC.sol";
import "./bridge/ITBTCToken.sol";
import {ZeroAddress} from "./utils/Errors.sol";

/// @title Bitcoin Redeemer
/// @notice This contract facilitates redemption of stBTC tokens to Bitcoin through
///         tBTC redemption process.
contract BitcoinRedeemer is Ownable2StepUpgradeable, IReceiveApproval {
    /// Interface for tBTC token contract.
    ITBTCToken public tbtcToken;

    /// stBTC token contract.
    stBTC public stbtc;

    /// Address of the TBTCVault contract.
    address public tbtcVault;

    /// Emitted when the TBTCVault contract address is updated.
    /// @param oldTbtcVault Address of the old TBTCVault contract.
    /// @param newTbtcVault Address of the new TBTCVault contract.
    event TbtcVaultUpdated(address oldTbtcVault, address newTbtcVault);

    /// Emitted when redemption is requested.
    /// @param owner Owner of stBTC tokens.
    /// @param shares Number of stBTC tokens.
    /// @param tbtcAmount Number of tBTC tokens.
    event RedemptionRequested(
        address indexed owner,
        uint256 shares,
        uint256 tbtcAmount
    );

    /// Reverts if the tBTC Token address is zero.
    error TbtcTokenZeroAddress();

    /// Reverts if the stBTC address is zero.
    error StbtcZeroAddress();

    /// Reverts if the TBTCVault address is zero.
    error TbtcVaultZeroAddress();

    /// Attempted to call receiveApproval by supported token.
    error CallerNotAllowed(address caller);

    /// Attempted to call receiveApproval with empty data.
    error EmptyExtraData();

    /// Attempted to call redeemSharesAndUnmint with unexpected tBTC token owner.
    error UnexpectedTbtcTokenOwner();

    /// Reverts if the redeemer is not the deposit owner.
    error RedeemerNotOwner(address redeemer, address owner);

    /// Reverts when approveAndCall to tBTC contract fails.
    error ApproveAndCallFailed();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract with tBTC token and stBTC token addresses.
    /// @param _tbtcToken The address of the tBTC token contract.
    /// @param _stbtc The address of the stBTC token contract.
    /// @param _tbtcVault The address of the TBTCVault contract.
    function initialize(
        address _tbtcToken,
        address _stbtc,
        address _tbtcVault
    ) public initializer {
        __Ownable2Step_init();
        __Ownable_init(msg.sender);

        if (address(_tbtcToken) == address(0)) {
            revert TbtcTokenZeroAddress();
        }
        if (address(_stbtc) == address(0)) {
            revert StbtcZeroAddress();
        }
        if (address(_tbtcVault) == address(0)) {
            revert TbtcVaultZeroAddress();
        }

        tbtcToken = ITBTCToken(_tbtcToken);
        stbtc = stBTC(_stbtc);
        tbtcVault = _tbtcVault;
    }

    /// @notice Redeems shares for tBTC and requests bridging to Bitcoin.
    /// @param from Shares token holder executing redemption.
    /// @param amount Amount of shares to redeem.
    /// @param extraData Redemption data in a format expected from
    ///        `redemptionData` parameter of Bridge's `receiveBalanceApproval`
    ///        function.
    function receiveApproval(
        address from,
        uint256 amount,
        address,
        bytes calldata extraData
    ) external {
        if (msg.sender != address(stbtc)) revert CallerNotAllowed(msg.sender);
        if (extraData.length == 0) revert EmptyExtraData();

        redeemSharesAndUnmint(from, amount, extraData);
    }

    /// @notice Updates TBTCVault contract address.
    /// @param newTbtcVault New TBTCVault contract address.
    function updateTbtcVault(address newTbtcVault) external onlyOwner {
        if (newTbtcVault == address(0)) {
            revert ZeroAddress();
        }

        emit TbtcVaultUpdated(tbtcVault, newTbtcVault);

        tbtcVault = newTbtcVault;
    }

    /// @notice Initiates the redemption process by exchanging stBTC tokens for
    ///         tBTC tokens and requesting bridging to Bitcoin.
    /// @dev Redeems stBTC shares to receive tBTC and requests redemption of tBTC
    ///      to Bitcoin via tBTC Bridge.
    ///      Redemption data in a format expected from `redemptionData` parameter
    ///      of Bridge's `receiveBalanceApproval`.
    ///      It uses tBTC token owner which is the TBTCVault contract as spender
    ///      of tBTC requested for redemption.
    /// @dev tBTC Bridge redemption process has a path where request can timeout.
    ///      It is a scenario that is unlikely to happen with the current Bridge
    ///      setup. This contract remains upgradable to have flexibility to handle
    ///      adjustments to tBTC Bridge changes.
    /// @dev Redemption data should include a `redeemer` address matching the
    ///      address of the deposit owner who is redeeming the shares. In case anything
    ///      goes wrong during the tBTC unminting process, the redeemer will be
    ///      able to claim the tBTC tokens back from the tBTC Bank contract.
    /// @param owner The owner of the stBTC tokens.
    /// @param shares The number of stBTC tokens to redeem.
    /// @param tbtcRedemptionData Additional data required for the tBTC redemption.
    ///        See `redemptionData` parameter description of `Bridge.requestRedemption`
    ///        function.
    function redeemSharesAndUnmint(
        address owner,
        uint256 shares,
        bytes calldata tbtcRedemptionData
    ) internal {
        // TBTC Token contract owner resolves to the TBTCVault contract.
        if (tbtcToken.owner() != tbtcVault) revert UnexpectedTbtcTokenOwner();

        // Decode the redemption data to get the redeemer address.
        (address redeemer, , , , , ) = abi.decode(
            tbtcRedemptionData,
            (address, bytes20, bytes32, uint32, uint64, bytes)
        );
        if (redeemer != owner) revert RedeemerNotOwner(redeemer, owner);

        uint256 tbtcAmount = stbtc.redeem(shares, address(this), owner);

        // slither-disable-next-line reentrancy-events
        emit RedemptionRequested(owner, shares, tbtcAmount);

        if (
            !tbtcToken.approveAndCall(tbtcVault, tbtcAmount, tbtcRedemptionData)
        ) {
            revert ApproveAndCallFailed();
        }
    }
}
