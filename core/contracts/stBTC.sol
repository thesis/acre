// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Dispatcher.sol";
import { xERC4626 } from './lib/xERC4626.sol';
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

interface IAllocator {
  function totalAssets() external view returns (uint256);

  function lastTotalAssets() external view returns (uint256);

  function withdraw(uint256 _assets, address _receiver) external;

  function allocate() external;

  function free() external;
}

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
contract stBTC is xERC4626, Ownable {
    using SafeERC20 for IERC20;
    using SafeCast for *;

    /// Dispatcher contract that routes tBTC from stBTC to a given vault and back.
    Dispatcher public dispatcher;

    IAllocator public allocator;

    /// Address of the treasury wallet, where fees should be transferred to.
    address public treasury;

    /// Minimum amount for a single deposit operation.
    uint256 public minimumDepositAmount;
    /// Maximum total amount of tBTC token held by Acre protocol.
    uint256 public maximumTotalAssets;

    /// Emitted when the treasury wallet address is updated.
    /// @param treasury New treasury wallet address.
    event TreasuryUpdated(address treasury);

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
    error LessThanMinDeposit(uint256 amount, uint256 min);

    /// Reverts if the address is zero.
    error ZeroAddress();

    /// Reverts if the address is disallowed.
    error DisallowedAddress();

    constructor(
        IERC20 _tbtc,
        address _treasury,
        uint32 _rewardsCycleLength
    ) ERC4626(_tbtc) ERC20("Acre Staked Bitcoin", "stBTC") Ownable(msg.sender)
         xERC4626(_rewardsCycleLength) // TODO: revisit initialization
    {
        if (address(_treasury) == address(0)) {
            revert ZeroAddress();
        }
        treasury = _treasury;
        // TODO: Revisit the exact values closer to the launch.
        minimumDepositAmount = 0.001 * 1e18; // 0.001 tBTC
        maximumTotalAssets = 25 * 1e18; // 25 tBTC
    }

    modifier andSync() {
    if (block.timestamp >= rewardsCycleEnd) this.syncRewards();
    _;
  }

    function setAllocator(IAllocator _allocator) external onlyOwner {
        require(address(_allocator) != address(0), 'ZERO_ADDRESS');
        allocator = _allocator;
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

    /// @notice Updates deposit parameters.
    /// @dev To disable the limit for deposits, set the maximum total assets to
    ///      maximum (`type(uint256).max`).
    /// @param _minimumDepositAmount New value of the minimum deposit amount. It
    ///        is the minimum amount for a single deposit operation.
    /// @param _maximumTotalAssets New value of the maximum total assets amount.
    ///        It is the maximum amount of the tBTC token that the Acre protocol
    ///        can hold.
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
    /// @param assets Approved amount of tBTC tokens to deposit.
    /// @param receiver The address to which the shares will be minted.
    /// @return shares Minted shares.
    function deposit(
        uint256 assets,
        address receiver
    ) public override andSync returns (uint256 shares) {
        if (assets < minimumDepositAmount) {
            revert LessThanMinDeposit(assets, minimumDepositAmount);
        }
        require(address(allocator) != address(0), 'NOT_INITIALIZED');
        // Check for rounding error since we round down in previewDeposit.
        require((shares = super.previewDeposit(assets)) != 0, 'ZERO_SHARES');

        // Need to transfer before minting or ERC777s could reenter.
        IERC20(asset()).safeTransferFrom(msg.sender, address(allocator), assets);

        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);

        afterDeposit(assets);
    }

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override andSync returns (uint256 shares) {
        shares = previewWithdraw(assets); // No need to check for rounding error, previewWithdraw rounds up.

        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender); // Saves gas for limited approvals.

            if (allowed != type(uint256).max)
                _approve(owner, msg.sender, allowed - shares);
        }

        beforeWithdraw(assets);

        _burn(owner, shares);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);

        allocator.withdraw(assets, receiver);
    }

    function redeem(
    uint256 shares,
    address receiver,
    address owner
    ) public override andSync returns (uint256 assets) {
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender); // Saves gas for limited approvals.

            if (allowed != type(uint256).max)
                _approve(owner, msg.sender, allowed - shares);
        }

        // Check for rounding error since we round down in previewRedeem.
        require((assets = previewRedeem(shares)) != 0, 'ZERO_ASSETS');

        beforeWithdraw(assets);

        _burn(owner, shares);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);

        allocator.withdraw(assets, receiver);
    }

    /// @notice Mints shares to receiver by depositing tBTC tokens.
    /// @dev Takes into account a deposit parameter, minimum deposit amount,
    ///      which determines the minimum amount for a single deposit operation.
    ///      The amount of the assets has to be pre-approved in the tBTC
    ///      contract.
    ///      The msg.sender is required to grant approval for tBTC transfer.
    ///      To determine the total assets amount necessary for approval
    ///      corresponding to a given share amount, use the `previewMint` function.
    /// @param shares Amount of shares to mint.
    /// @param receiver The address to which the shares will be minted.
    function mint(
        uint256 shares,
        address receiver
    ) public override andSync returns (uint256 assets) {
        if ((assets = super.mint(shares, receiver)) < minimumDepositAmount) {
            revert LessThanMinDeposit(assets, minimumDepositAmount);
        }

        assets = previewMint(shares); // No need to check for rounding error, previewMint rounds up.

        // Need to transfer before minting or ERC777s could reenter.
        IERC20(asset()).safeTransferFrom(msg.sender, address(allocator), assets);

        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);

        afterDeposit(assets);
    }

    /// @notice Returns value of assets that would be exchanged for the amount of
    ///         shares owned by the `account`.
    /// @param account Owner of shares.
    /// @return Assets amount.
    function assetsBalanceOf(address account) public view returns (uint256) {
        return convertToAssets(balanceOf(account));
    }

    /// @notice Returns the maximum amount of the tBTC token that can be
    ///         deposited into the vault for the receiver through a deposit
    ///         call. It takes into account the deposit parameter, maximum total
    ///         assets, which determines the total amount of tBTC token held by
    ///         Acre protocol.
    /// @dev When the remaining amount of unused limit is less than the minimum
    ///      deposit amount, this function returns 0.
    /// @return The maximum amount of tBTC token that can be deposited into
    ///         Acre protocol for the receiver.
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
    /// @dev Since the stBTC contract limits the maximum total tBTC tokens this
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

    function syncRewards() public override {
        require(
            msg.sender == address(allocator) || msg.sender == address(this),
            'UNAUTHORIZED'
        );

        uint192 lastRewardAmount_ = lastRewardAmount;
        uint32 timestamp = block.timestamp.toUint32();

        if (timestamp < rewardsCycleEnd) revert SyncError();

        uint256 storedTotalAssets_ = storedTotalAssets;
        uint256 nextRewards = allocator.lastTotalAssets() -
            storedTotalAssets_ -
            lastRewardAmount_;

        storedTotalAssets = storedTotalAssets_ + lastRewardAmount_; // SSTORE

        uint32 end = ((timestamp + rewardsCycleLength) / rewardsCycleLength) *
            rewardsCycleLength;

        // Combined single SSTORE
        lastRewardAmount = nextRewards.toUint192();
        lastSync = timestamp;
        rewardsCycleEnd = end;

        emit NewRewardsCycle(end, nextRewards);
    }
}
