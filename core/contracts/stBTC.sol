// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Dispatcher.sol";
import "./PausableOwnable.sol";
import "./lib/ERC4626Fees.sol";
import "./interfaces/IDispatcher.sol";
import {ZeroAddress} from "./utils/Errors.sol";

/// @title stBTC
/// @notice This contract implements the ERC-4626 tokenized vault standard. By
///         staking tBTC, users acquire a liquid staking token called stBTC,
///         commonly referred to as "shares". The staked tBTC is securely
///         deposited into Acre's vaults, where it generates yield over time.
///         Users have the flexibility to redeem stBTC, enabling them to
///         withdraw their staked tBTC along with the accrued yield.
/// @dev ERC-4626 is a standard to optimize and unify the technical parameters
///      of yield-bearing vaults. This contract facilitates the minting and
///      burning of shares (stBTC), which are represented as standard ERC20
///      tokens, providing a seamless exchange with tBTC tokens.
contract stBTC is ERC4626Fees, PausableOwnable {
    using SafeERC20 for IERC20;

    /// Dispatcher contract that routes tBTC from stBTC to a given allocation
    /// contract and back.
    IDispatcher public dispatcher;

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

    /// Emitted when the treasury wallet address is updated.
    /// @param treasury New treasury wallet address.
    event TreasuryUpdated(address treasury);

    /// Emitted when deposit parameters are updated.
    /// @param minimumDepositAmount New value of the minimum deposit amount.
    event MinimumDepositAmountUpdated(uint256 minimumDepositAmount);

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

    /// Reverts if the amount is less than the minimum deposit amount.
    /// @param amount Amount to check.
    /// @param min Minimum amount to check 'amount' against.
    error LessThanMinDeposit(uint256 amount, uint256 min);

    /// Reverts if the address is disallowed.
    error DisallowedAddress();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IERC20 asset, address _treasury) public initializer {
        __ERC4626_init(asset);
        __ERC20_init("Acre Staked Bitcoin", "stBTC");
        __PausableOwnable_init(msg.sender, msg.sender);

        if (address(_treasury) == address(0)) {
            revert ZeroAddress();
        }
        treasury = _treasury;

        // TODO: Revisit the exact values closer to the launch.
        minimumDepositAmount = 0.001 * 1e18; // 0.001 tBTC
        entryFeeBasisPoints = 0; // TODO: tbd
        exitFeeBasisPoints = 0; // TODO: tbd
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
        treasury = newTreasury;

        emit TreasuryUpdated(newTreasury);
    }

    /// @notice Updates minimum deposit amount.
    /// @param newMinimumDepositAmount New value of the minimum deposit amount. It
    ///        is the minimum amount for a single deposit operation.
    function updateMinimumDepositAmount(
        uint256 newMinimumDepositAmount
    ) external onlyOwner {
        // TODO: Introduce a parameters update process.
        minimumDepositAmount = newMinimumDepositAmount;

        emit MinimumDepositAmountUpdated(newMinimumDepositAmount);
    }

    // TODO: Implement a governed upgrade process that initiates an update and
    //       then finalizes it after a delay.
    /// @notice Updates the dispatcher contract and gives it an unlimited
    ///         allowance to transfer staked tBTC.
    /// @param newDispatcher Address of the new dispatcher contract.
    function updateDispatcher(IDispatcher newDispatcher) external onlyOwner {
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

    /// @notice Returns the total amount of assets held by the vault across all
    ///         allocations and this contract.
    function totalAssets() public view override returns (uint256) {
        uint256 totalAmount = IERC20(asset()).balanceOf(address(this));
        totalAmount += dispatcher.totalAssets();
        return totalAmount;
    }

    /// @notice Mints shares to receiver by depositing exactly amount of
    ///         tBTC tokens.
    /// @dev Takes into account a deposit parameter, minimum deposit amount,
    ///      which determines the minimum amount for a single deposit operation.
    ///      The amount of the assets has to be pre-approved in the tBTC
    ///      contract.
    /// @param assets Approved amount of tBTC tokens to deposit. This includes
    ///               treasury fees for staking tBTC.
    /// @param receiver The address to which the shares will be minted.
    /// @return Minted shares adjusted for the fees taken by the treasury.
    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused returns (uint256) {
        if (assets < minimumDepositAmount) {
            revert LessThanMinDeposit(assets, minimumDepositAmount);
        }

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
    ) public override whenNotPaused returns (uint256 assets) {
        if ((assets = super.mint(shares, receiver)) < minimumDepositAmount) {
            revert LessThanMinDeposit(assets, minimumDepositAmount);
        }
    }

    /// @notice Withdraws assets from the vault and transfers them to the
    ///         receiver.
    /// @dev Withdraw unallocated assets first and and if not enough, then pull
    ///      the assets from the dispatcher.
    /// @param assets Amount of assets to withdraw.
    /// @param receiver The address to which the assets will be transferred.
    /// @param owner The address of the owner of the shares.
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override whenNotPaused returns (uint256) {
        uint256 currentAssetsBalance = IERC20(asset()).balanceOf(address(this));
        if (assets > currentAssetsBalance) {
            dispatcher.withdraw(assets - currentAssetsBalance);
        }

        return super.withdraw(assets, receiver, owner);
    }

    /// @notice Redeems shares for assets and transfers them to the receiver.
    /// @dev Redeem unallocated assets first and and if not enough, then pull
    ///      the assets from the dispatcher.
    /// @param shares Amount of shares to redeem.
    /// @param receiver The address to which the assets will be transferred.
    /// @param owner The address of the owner of the shares.
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public override whenNotPaused returns (uint256) {
        uint256 assets = convertToAssets(shares);
        uint256 currentAssetsBalance = IERC20(asset()).balanceOf(address(this));
        if (assets > currentAssetsBalance) {
            dispatcher.withdraw(assets - currentAssetsBalance);
        }

        return super.redeem(shares, receiver, owner);
    }

    /// @notice Returns value of assets that would be exchanged for the amount of
    ///         shares owned by the `account`.
    /// @param account Owner of shares.
    /// @return Assets amount.
    function assetsBalanceOf(address account) public view returns (uint256) {
        return convertToAssets(balanceOf(account));
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
