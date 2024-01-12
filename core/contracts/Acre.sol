// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import "./Dispatcher.sol";

/// @title Acre
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
contract Acre is ERC4626, Ownable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // bp (or bip) is one hundredth of 1 percent
    uint256 private constant BASIS_POINT_SCALE = 1e4;
    // TODO: decide on:
    // - how granular we want to go with the fee basis points
    // - should this value be a constant or updatable by governance
    // - are we okay having the same basis points for entry and exit fees
    uint256 private constant FEE_BASIS_POINTS = 10; // 0.1%

    /// Address of the treasury wallet, where fees should be transferred to.
    address public treasury;

    /// Dispatcher contract that routes tBTC from Acre to a given vault and back.
    Dispatcher public dispatcher;
    /// Minimum amount for a single deposit operation.
    uint256 public minimumDepositAmount;
    /// Maximum total amount of tBTC token held by Acre.
    uint256 public maximumTotalAssets;

    /// Emitted when a referral is used.
    /// @param referral Used for referral program.
    /// @param assets Amount of tBTC tokens staked.
    event StakeReferral(bytes32 indexed referral, uint256 assets);

    /// Emitted when deposit parameters are updated.
    /// @param minimumDepositAmount New value of the minimum deposit amount.
    /// @param maximumTotalAssets New value of the maximum total assets amount.
    event DepositParametersUpdated(
        uint256 minimumDepositAmount,
        uint256 maximumTotalAssets
    );

    /// Emitted when the dispatcher contract is updated.
    /// @param oldDispatcher Address of the old dispatcher contract.
    /// @param newDispatcher Address of the new dispatcher contract.
    event DispatcherUpdated(address oldDispatcher, address newDispatcher);

    /// Reverts if the amount is less than the minimum deposit amount.
    /// @param amount Amount to check.
    /// @param min Minimum amount to check 'amount' against.
    error DepositAmountLessThanMin(uint256 amount, uint256 min);

    /// Reverts if the address is zero.
    error ZeroAddress();

    constructor(
        IERC20 tbtc
    ) ERC4626(tbtc) ERC20("Acre Staked Bitcoin", "stBTC") Ownable(msg.sender) {
        // TODO: Revisit the exact values closer to the launch.
        minimumDepositAmount = 0.01 * 1e18; // 0.01 tBTC
        maximumTotalAssets = 25 * 1e18; // 25 tBTC
    }

    /// @notice Updates deposit parameters.
    /// @dev To disable the limit for deposits, set the maximum total assets to
    ///      maximum (`type(uint256).max`).
    /// @param _minimumDepositAmount New value of the minimum deposit amount. It
    ///        is the minimum amount for a single deposit operation.
    /// @param _maximumTotalAssets New value of the maximum total assets amount.
    ///        It is the maximum amount of the tBTC token that the Acre can
    ///        hold.
    function updateDepositParameters(
        uint256 _minimumDepositAmount,
        uint256 _maximumTotalAssets
    ) external onlyOwner {
        // TODO: Introduce a parameters update process.
        minimumDepositAmount = _minimumDepositAmount;
        maximumTotalAssets = _maximumTotalAssets;

        emit DepositParametersUpdated(
            _minimumDepositAmount,
            _maximumTotalAssets
        );
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

    /// @notice Mints shares to receiver by depositing exactly amount of
    ///         tBTC tokens.
    /// @dev Takes into account a deposit parameter, minimum deposit amount,
    ///      which determines the minimum amount for a single deposit operation.
    ///      The amount of the assets has to be pre-approved in the tBTC
    ///      contract.
    /// @param assets Approved amount of tBTC tokens to deposit. This includes
    ///               treasury fees for staking tBTC.
    /// @param receiver The address to which the shares will be minted.
    /// @return Minted shares.
    function deposit(
        uint256 assets,
        address receiver
    ) public override returns (uint256) {
        if (assets < minimumDepositAmount) {
            revert DepositAmountLessThanMin(assets, minimumDepositAmount);
        }

        uint256 fee = feeOnTotal(assets, FEE_BASIS_POINTS);

        if (fee > 0) {
            IERC20(asset()).safeTransfer(treasury, fee);
        }

        return super.deposit(assets - fee, receiver);
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
    /// @param shares Amount of shares to mint. To get the amount of share use
    ///        `previewMint`.
    /// @param receiver The address to which the shares will be minted.
    function mint(
        uint256 shares,
        address receiver
    ) public override returns (uint256 assets) {
        uint256 previewAssets = super.previewMint(shares);
        uint256 fee = feeOnRaw(previewAssets, FEE_BASIS_POINTS);

        if (fee > 0) {
            IERC20(asset()).safeTransferFrom(_msgSender(), treasury, fee);
        }

        if ((assets = super.mint(shares, receiver)) < minimumDepositAmount) {
            revert DepositAmountLessThanMin(assets, minimumDepositAmount);
        }
    }

    /// @notice Stakes a given amount of tBTC token and mints shares to a
    ///         receiver.
    /// @dev This function calls `deposit` function from `ERC4626` contract. The
    ///      amount of the assets has to be pre-approved in the tBTC contract.
    /// @param assets Approved amount for the transfer and stake.
    /// @param receiver The address to which the shares will be minted.
    /// @param referral Data used for referral program.
    /// @return shares Minted shares.
    function stake(
        uint256 assets,
        address receiver,
        bytes32 referral
    ) public returns (uint256) {
        // TODO: revisit the type of referral.
        uint256 shares = deposit(assets, receiver);

        if (referral != bytes32(0)) {
            emit StakeReferral(referral, assets);
        }

        return shares;
    }

    /// @notice Returns the maximum amount of the tBTC token that can be
    ///         deposited into the vault for the receiver, through a deposit
    ///         call. It takes into account the deposit parameter, maximum total
    ///         assets, which determines the total amount of tBTC token held by
    ///         Acre.
    /// @return The maximum amount of the tBTC token.
    function maxDeposit(address) public view override returns (uint256) {
        if (maximumTotalAssets == type(uint256).max) {
            return type(uint256).max;
        }

        uint256 _totalAssets = totalAssets();

        return
            _totalAssets >= maximumTotalAssets
                ? 0
                : maximumTotalAssets - _totalAssets;
    }

    /// @notice Returns the maximum amount of the vault shares that can be
    ///         minted for the receiver, through a mint call.
    /// @dev Since the Acre contract limits the maximum total tBTC tokens this
    ///      function converts the maximum deposit amount to shares.
    /// @return The maximum amount of the vault shares.
    function maxMint(address receiver) public view override returns (uint256) {
        uint256 _maxDeposit = maxDeposit(receiver);

        // slither-disable-next-line incorrect-equality
        return
            _maxDeposit == type(uint256).max
                ? type(uint256).max
                : convertToShares(_maxDeposit);
    }

    /// @return Returns deposit parameters.
    function depositParameters() public view returns (uint256, uint256) {
        return (minimumDepositAmount, maximumTotalAssets);
    }

    // TODO: remove FEE_BASIS_POINTS as a parameter if constant
    /// @notice Preview taking an entry fee on deposit.
    /// @param assets Amount to calculate the fee part of.
    function previewDeposit(
        uint256 assets
    ) public view virtual override returns (uint256) {
        uint256 fee = feeOnTotal(assets, FEE_BASIS_POINTS);
        return super.previewDeposit(assets - fee);
    }

    // TODO: remove FEE_BASIS_POINTS as a parameter if constant
    /// @notice Preview adding an entry fee on mint.
    /// @param shares Amount to calculate the fee part of.
    /// @return assets Amount of assets that will be minted for the given amount
    ///         of shares.
    function previewMint(
        uint256 shares
    ) public view virtual override returns (uint256) {
        uint256 assets = super.previewMint(shares);
        return assets + feeOnRaw(assets, FEE_BASIS_POINTS);
    }

    // TODO: replace feeBasisPoints with FEE_BASIS_POINTS if constant
    /// @notice Calculates the fee part of an amount `assets` that already includes fees.
    /// @param assets Amount to calculate the fee part of.
    /// @param feeBasisPoints Fee basis points.
    /// @return Fee part of the amount.
    function feeOnTotal(
        uint256 assets,
        uint256 feeBasisPoints
    ) private pure returns (uint256) {
        return
            assets.mulDiv(
                feeBasisPoints,
                feeBasisPoints + BASIS_POINT_SCALE,
                Math.Rounding.Ceil
            );
    }

    // TODO: replace feeBasisPoints with FEE_BASIS_POINTS if constant
    /// @notice Calculates the fees that should be added to an amount `assets` that does not already include fees.
    /// @param assets Amount to calculate the fee part of.
    /// @param feeBasisPoints Fee basis points.
    /// @return Fee part of the amount.
    function feeOnRaw(
        uint256 assets,
        uint256 feeBasisPoints
    ) private pure returns (uint256) {
        return
            assets.mulDiv(
                feeBasisPoints,
                BASIS_POINT_SCALE,
                Math.Rounding.Ceil
            );
    }
}
