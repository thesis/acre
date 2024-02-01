// SPDX-License-Identifier: MIT
// Rewards logic inspired by xERC20 (https://github.com/ZeframLou/playpen/blob/main/src/xERC20.sol)
// Source: https://github.com/ERC4626-Alliance/ERC4626-Contracts
// Differences:
// - replaced import from Solmate's ERC4626 with OpenZeppelin ERC4626
// - replaced import from Solmate's SafeCastLib with OpenZeppelin SafeCast
// - removed super.beforeWithdraw and super.afterDeposit calls
// - removed overrides from beforeWithdraw and afterDeposit
// - replaced `asset.balanceOf(address(this))` with `totalAssets()`
// - removed unused `shares` param from `beforeWithdraw` and `afterDeposit`
// - inherting from ERC4626Fees
// - minor formatting changes and solhint additions

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "../interfaces/IxERC4626.sol";
import "../lib/ERC4626Fees.sol";

/**
 @title  An xERC4626 Single Staking Contract
 @notice This contract allows users to autocompound rewards denominated in an underlying reward token.
         It is fully compatible with [ERC4626](https://eips.ethereum.org/EIPS/eip-4626) allowing for DeFi composability.
         It maintains balances using internal accounting to prevent instantaneous changes in the exchange rate.
         NOTE: an exception is at contract creation, when a reward cycle begins before the first deposit. After the first deposit, exchange rate updates smoothly.

         Operates on "cycles" which distribute the rewards surplus over the internal balance to users linearly over the remainder of the cycle window.
*/
abstract contract xERC4626 is IxERC4626, ERC4626Fees {
    using SafeCast for *;

    /// @notice the maximum length of a rewards cycle
    uint32 public immutable rewardsCycleLength;

    /// @notice the effective start of the current cycle
    uint32 public lastSync;

    /// @notice the end of the current cycle. Will always be evenly divisible by `rewardsCycleLength`.
    uint32 public rewardsCycleEnd;

    /// @notice the amount of rewards distributed in a the most recent cycle.
    uint192 public lastRewardAmount;

    uint256 internal storedTotalAssets;

    constructor(uint32 _rewardsCycleLength) {
        rewardsCycleLength = _rewardsCycleLength;
        // seed initial rewardsCycleEnd
        /* solhint-disable not-rely-on-time */
        rewardsCycleEnd =
            (block.timestamp.toUint32() / rewardsCycleLength) *
            rewardsCycleLength;
    }

    /// @notice Distributes rewards to xERC4626 holders.
    ///         All surplus `asset` balance of the contract over the internal
    ///         balance becomes queued for the next cycle.
    function syncRewards() public virtual {
        uint192 lastRewardAmount_ = lastRewardAmount;
        /* solhint-disable-next-line not-rely-on-time */
        uint32 timestamp = block.timestamp.toUint32();

        if (timestamp < rewardsCycleEnd) revert SyncError();

        uint256 storedTotalAssets_ = storedTotalAssets;
        uint256 nextRewards = totalAssets() -
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

    /// @notice Compute the amount of tokens available to share holders.
    ///         Increases linearly during a reward distribution period from the
    ///         sync call, not the cycle start.
    function totalAssets() public view override returns (uint256) {
        // cache global vars
        uint256 storedTotalAssets_ = storedTotalAssets;
        uint192 lastRewardAmount_ = lastRewardAmount;
        uint32 rewardsCycleEnd_ = rewardsCycleEnd;
        uint32 lastSync_ = lastSync;

        /* solhint-disable-next-line not-rely-on-time */
        if (block.timestamp >= rewardsCycleEnd_) {
            // no rewards or rewards fully unlocked
            // entire reward amount is available
            return storedTotalAssets_ + lastRewardAmount_;
        }

        // rewards not fully unlocked
        // add unlocked rewards to stored total
        /* solhint-disable not-rely-on-time */
        uint256 unlockedRewards = (lastRewardAmount_ *
            (block.timestamp - lastSync_)) / (rewardsCycleEnd_ - lastSync_);
        return storedTotalAssets_ + unlockedRewards;
    }

    // Update storedTotalAssets on withdraw/redeem
    function beforeWithdraw(uint256 amount) internal virtual {
        storedTotalAssets -= amount;
    }

    // Update storedTotalAssets on deposit/mint
    function afterDeposit(uint256 amount) internal virtual {
        storedTotalAssets += amount;
    }
}
