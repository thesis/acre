// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

import "@thesis-co/solidity-contracts/contracts/token/IReceiveApproval.sol";

import "../../BitcoinRedeemer.sol";
import "../../Dispatcher.sol";
import "../../lib/ERC4626Fees.sol";

/// @title stBTCV2
/// @dev  This is a contract used to test stBTC upgradeability. It is a copy of
///       stBTC contract with some differences marked with `TEST:` comments.
contract stBTCV2 is ERC4626Fees, Ownable2StepUpgradeable {
    using SafeERC20 for IERC20;

    /// Dispatcher contract that routes tBTC from stBTC to a given vault and back.
    Dispatcher public dispatcher;

    /// BitcoinRedeemer contract.
    BitcoinRedeemer public bitcoinRedeemer;

    /// Address of the treasury wallet, where fees should be transferred to.
    address public treasury;

    /// Minimum amount for a single deposit operation. The value should be set
    /// low enough so the deposits routed through Bitcoin Depositor contract won't
    /// be rejected. It means that minimumDepositAmount should be lower than
    /// tBTC protocol's depositDustThreshold reduced by all the minting fees taken
    /// before depositing in the Acre contract.
    uint256 public minimumDepositAmount;

    /// Entry fee basis points applied to entry fee calculation.
    uint256 public entryFeeBasisPoints;

    /// Exit fee basis points applied to exit fee calculation.
    uint256 public exitFeeBasisPoints;

    // TEST: New variable.
    uint256 public newVariable;

    /// Emitted when the treasury wallet address is updated.
    /// @param oldTreasury Address of the old treasury wallet.
    /// @param newTreasury Address of the new treasury wallet.
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    /// Emitted when deposit parameters are updated.
    /// @param minimumDepositAmount New value of the minimum deposit amount.
    event DepositParametersUpdated(uint256 minimumDepositAmount);

    /// Emitted when the BitcoinRedeemer contract is updated.
    /// @param oldBitcoinRedeemer Address of the old BitcoinRedeemer contract.
    /// @param newBitcoinRedeemer Address of the new BitcoinRedeemer contract.
    event BitcoinRedeemerUpdated(
        address oldBitcoinRedeemer,
        address newBitcoinRedeemer
    );

    /// Emitted when the dispatcher contract is updated.
    /// @param oldDispatcher Address of the old dispatcher contract.
    /// @param newDispatcher Address of the new dispatcher contract.
    event DispatcherUpdated(address oldDispatcher, address newDispatcher);

    /// Emitted when the entry fee basis points are updated.
    /// @param entryFeeBasisPoints New value of the fee basis points.
    event EntryFeeBasisPointsUpdated(uint256 entryFeeBasisPoints);

    /// Emitted when the exit fee basis points are updated.
    /// @param exitFeeBasisPoints New value of the fee basis points.
    event ExitFeeBasisPointsUpdated(uint256 exitFeeBasisPoints);

    // TEST: New event.
    event NewEvent();

    /// Reverts if the amount is less than the minimum deposit amount.
    /// @param amount Amount to check.
    /// @param min Minimum amount to check 'amount' against.
    error LessThanMinDeposit(uint256 amount, uint256 min);

    /// Reverts if the address is zero.
    error ZeroAddress();

    /// Reverts if the address is disallowed.
    error DisallowedAddress();

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

    /// @notice Updates treasury wallet address.
    /// @param newTreasury New treasury wallet address.
    function updateTreasury(address newTreasury) external onlyOwner {
        // TODO: Introduce a parameters update process.
        if (newTreasury == address(0)) {
            revert ZeroAddress();
        }
        if (newTreasury == address(this)) {
            revert DisallowedAddress();
        }

        emit TreasuryUpdated(treasury, newTreasury);

        treasury = newTreasury;
    }

    /// @notice Updates deposit parameters.
    /// @param _minimumDepositAmount New value of the minimum deposit amount. It
    ///        is the minimum amount for a single deposit operation.
    function updateDepositParameters(
        uint256 _minimumDepositAmount
    ) external onlyOwner {
        // TODO: Introduce a parameters update process.
        minimumDepositAmount = _minimumDepositAmount;

        emit DepositParametersUpdated(_minimumDepositAmount);
    }

    /// @notice Updates the BitcoinRedeemer contract.
    /// @param newBitcoinRedeemer Address of the new BitcoinRedeemer contract.
    function updateBitcoinRedeemer(
        address newBitcoinRedeemer
    ) external onlyOwner {
        if (newBitcoinRedeemer == address(0)) {
            revert ZeroAddress();
        }

        emit BitcoinRedeemerUpdated(
            address(bitcoinRedeemer),
            newBitcoinRedeemer
        );

        bitcoinRedeemer = BitcoinRedeemer(newBitcoinRedeemer);
    }

    // TODO: Implement a governed upgrade process that initiates an update and
    //       then finalizes it after a delay.
    /// @notice Updates the dispatcher contract and gives it an unlimited
    ///         allowance to transfer staked tBTC.
    /// @param newDispatcher Address of the new dispatcher contract.
    function updateDispatcher(Dispatcher newDispatcher) external onlyOwner {
        if (address(newDispatcher) == address(0)) {
            revert ZeroAddress();
        }

        address oldDispatcher = address(dispatcher);

        emit DispatcherUpdated(oldDispatcher, address(newDispatcher));
        dispatcher = newDispatcher;

        // TODO: Once withdrawal/rebalancing is implemented, we need to revoke the
        // approval of the vaults share tokens from the old dispatcher and approve
        // a new dispatcher to manage the share tokens.

        if (oldDispatcher != address(0)) {
            // Setting allowance to zero for the old dispatcher
            IERC20(asset()).forceApprove(oldDispatcher, 0);
        }

        // Setting allowance to max for the new dispatcher
        IERC20(asset()).forceApprove(address(dispatcher), type(uint256).max);
    }

    // TODO: Implement a governed upgrade process that initiates an update and
    //       then finalizes it after a delay.
    /// @notice Update the entry fee basis points.
    /// @param newEntryFeeBasisPoints New value of the fee basis points.
    function updateEntryFeeBasisPoints(
        uint256 newEntryFeeBasisPoints
    ) external onlyOwner {
        entryFeeBasisPoints = newEntryFeeBasisPoints;

        emit EntryFeeBasisPointsUpdated(newEntryFeeBasisPoints);
    }

    // TODO: Implement a governed upgrade process that initiates an update and
    //       then finalizes it after a delay.
    /// @notice Update the exit fee basis points.
    /// @param newExitFeeBasisPoints New value of the fee basis points.
    function updateExitFeeBasisPoints(
        uint256 newExitFeeBasisPoints
    ) external onlyOwner {
        exitFeeBasisPoints = newExitFeeBasisPoints;

        emit ExitFeeBasisPointsUpdated(newExitFeeBasisPoints);
    }

    /// @notice Calls `receiveApproval` function on spender previously approving
    ///         the spender to withdraw from the caller multiple times, up to
    ///         the `amount` amount. If this function is called again, it
    ///         overwrites the current allowance with `amount`. Reverts if the
    ///         approval reverted or if `receiveApproval` call on the spender
    ///         reverted.
    /// @return True if both approval and `receiveApproval` calls succeeded.
    /// @dev If the `amount` is set to `type(uint256).max` then
    ///      `transferFrom` and `burnFrom` will not reduce an allowance.
    function approveAndCall(
        address spender,
        uint256 value,
        bytes memory extraData
    ) external returns (bool) {
        if (approve(spender, value)) {
            IReceiveApproval(spender).receiveApproval(
                _msgSender(),
                value,
                address(this),
                extraData
            );
            return true;
        }
        return false;
    }

    // TEST: Modified function.
    function deposit(
        uint256 assets,
        address receiver
    ) public override returns (uint256) {
        if (assets < minimumDepositAmount) {
            revert LessThanMinDeposit(assets, minimumDepositAmount);
        }
        // TEST: Emit new event.
        emit NewEvent();

        return super.deposit(assets, receiver);
    }

    /// @notice Mints shares to receiver by depositing tBTC tokens.
    /// @dev Takes into account a deposit parameter, minimum deposit amount,
    ///      which determines the minimum amount for a single deposit operation.
    ///      The amount of the assets has to be pre-approved in the tBTC
    ///      contract.
    ///      The msg.sender is required to grant approval for the transfer of a
    ///      certain amount of tBTC, and in addition, approval for the associated
    ///      fee. Specifically, the total amount to be approved (amountToApprove)
    ///      should be equal to the sum of the deposited amount and the fee.
    ///      To determine the total assets amount necessary for approval
    ///      corresponding to a given share amount, use the `previewMint` function.
    /// @param shares Amount of shares to mint.
    /// @param receiver The address to which the shares will be minted.
    /// @return assets Used assets to mint shares.
    function mint(
        uint256 shares,
        address receiver
    ) public override returns (uint256 assets) {
        if ((assets = super.mint(shares, receiver)) < minimumDepositAmount) {
            revert LessThanMinDeposit(assets, minimumDepositAmount);
        }
    }

    /// @notice Returns value of assets that would be exchanged for the amount of
    ///         shares owned by the `account`.
    /// @param account Owner of shares.
    /// @return Assets amount.
    function assetsBalanceOf(address account) public view returns (uint256) {
        return convertToAssets(balanceOf(account));
    }

    /// @return Returns deposit parameters.
    function depositParameters() public view returns (uint256) {
        return (minimumDepositAmount);
    }

    /// @return Returns entry fee basis point used in deposits.
    function _entryFeeBasisPoints() internal view override returns (uint256) {
        return entryFeeBasisPoints;
    }

    /// @return Returns exit fee basis point used in withdrawals.
    function _exitFeeBasisPoints() internal view override returns (uint256) {
        return exitFeeBasisPoints;
    }

    /// @notice Returns the address of the treasury wallet, where fees should be
    ///         transferred to.
    function _feeRecipient() internal view override returns (address) {
        return treasury;
    }
}
