// SPDX-License-Identifier: UNLICENSED

// Source: https://github.com/decoupleco/stBTC/blob/main/contracts/reserve.sol
// Differences:
// - Replacing Solmate with OpenZeppelin imports
// - Replacing usage of Solamte's functions with OZ equivalents
// - Linting
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IMinimal4626} from "./interfaces/IMinimal4626.sol";
import {ILP4626} from "./interfaces/ILP4626.sol";
import {IReserve} from "./interfaces/IReserve.sol";

contract Reserve is IReserve, Ownable {
    using SafeERC20 for IERC20;

    address public allocator;
    uint64 public performanceFeeRatio;
    uint64 public withdrawFeeRatio;

    // token specific deposits
    // tBTC += amount
    // WBTC += amount
    mapping(address => uint256) public totalDeposits;
    // token specific withdraws
    // tBTC += amount
    // WBTC += amount
    mapping(address => uint256) public totalWithdraws;
    // token specific accumulators, can be negative
    // tBTC -= amount
    // WBTC += amount
    mapping(address => int256) public divergenceCover;
    // tBTC accumulators, updated on settlement
    uint128 public profitFee;
    uint128 public lossCover;
    // tBTC accumulators, updates on every withdraw
    uint128 public withdrawFee;
    // updated at
    uint128 public blockTimestamp;

    modifier onlyAllocator() {
        require(msg.sender == allocator, "AllocatorOnly");
        _;
    }

    constructor(
        uint64 _performanceFeeRatio,
        uint64 _withdrawFeeRatio
    ) Ownable(msg.sender) {
        performanceFeeRatio = _performanceFeeRatio;
        withdrawFeeRatio = _withdrawFeeRatio;
    }

    /*//////////////////////////////////////////////////////////////
                        Admin Only
    //////////////////////////////////////////////////////////////*/

    function setAllocator(address _allocator) external onlyOwner {
        require(_allocator != address(0), "ZERO_ADDRESS");
        allocator = _allocator;
    }

    function setPerformanceFeeRatio(
        uint64 _performanceFeeRatio
    ) external onlyOwner {
        performanceFeeRatio = _performanceFeeRatio;
    }

    function setWithdrawFeeRatio(uint64 _withdrawFeeRatio) external onlyOwner {
        withdrawFeeRatio = _withdrawFeeRatio;
    }

    function deposit(address _token, uint256 _amount) external onlyOwner {
        _deposit(_token, msg.sender, _amount);
    }

    function withdraw(address _token, uint256 _amount) external onlyOwner {
        _withdraw(_token, msg.sender, _amount);
    }

    /*//////////////////////////////////////////////////////////////
                        Allocator Only
    //////////////////////////////////////////////////////////////*/

    function allocate(
        ILP4626 _strategy,
        address _baseToken,
        uint256 _baseAmount,
        uint256 _quoteAmount,
        uint32 _baseRatio
    ) external onlyAllocator {
        if (_baseRatio == 0) return;

        uint256 reserveBaseAmount;
        if (_baseAmount > 0) {
            uint256 baseTotal = ((_baseAmount +
                _strategy.convert(_quoteAmount, false)) * _baseRatio) / 10_000;
            if (baseTotal > _baseAmount)
                reserveBaseAmount = baseTotal - _baseAmount;
        } else {
            reserveBaseAmount =
                (_strategy.convert(_quoteAmount, false) * _baseRatio) /
                10_000;
        }

        if (reserveBaseAmount > 0) {
            uint256 reserveBaseBalance = _balanceOf(_baseToken, address(this));
            if (reserveBaseAmount > reserveBaseBalance) {
                reserveBaseAmount = reserveBaseBalance;
            }
            _strategy.deposit(reserveBaseAmount, 0, address(this));

            // update stats
            totalWithdraws[_baseToken] += reserveBaseAmount;
            /* solhint-disable not-rely-on-time */
            blockTimestamp = uint128(block.timestamp);
        }
    }

    function free(IMinimal4626 _strategy) external onlyAllocator {
        uint256 reserveShares = _strategy.maxRedeem(address(this));
        if (reserveShares > 0) {
            _strategy.redeem(reserveShares, address(this), address(this));
        }
    }

    // swap quote to base
    function swap(
        ILP4626 _strategy,
        address _quoteToken,
        uint256 _baseAmountDesired
    ) external onlyAllocator returns (uint256 baseLeft) {
        uint256 reserveQuoteBalance = _balanceOf(_quoteToken, address(this));
        uint256 quoteAmountDesired = _strategy.convert(
            _baseAmountDesired,
            true
        );
        uint256 quoteAmount;
        uint256 baseAmount;
        if (quoteAmountDesired > reserveQuoteBalance) {
            quoteAmount = quoteAmountDesired - reserveQuoteBalance;
            baseAmount = _strategy.convert(quoteAmount, false);
        } else {
            quoteAmount = quoteAmountDesired;
            baseAmount = _baseAmountDesired;
        }

        // transfer quote token (tBTC) from reserve to allocator
        _withdraw(_quoteToken, msg.sender, quoteAmount);
        // transfer base token from allocator to reserve
        _deposit(_strategy.baseToken(), msg.sender, baseAmount);
        baseLeft = _baseAmountDesired - baseAmount;
    }

    function coverLoss(address _token, uint256 _amount) external onlyAllocator {
        // update stats
        lossCover += uint128(_amount);
        /* solhint-disable not-rely-on-time */
        blockTimestamp = uint128(block.timestamp);

        // transfer tokens out
        _transfer(_token, msg.sender, _amount);
    }

    // transfers quote token to strategy
    // receive base token from strategy
    function coverDivergence(
        address _baseToken,
        uint256 _baseAmount,
        address _quoteToken,
        uint256 _quoteAmount
    ) external onlyAllocator {
        // update stats
        divergenceCover[_baseToken] += int256(_baseAmount);
        divergenceCover[_quoteToken] += -int256(_quoteAmount);
        /* solhint-disable not-rely-on-time */
        blockTimestamp = uint128(block.timestamp);

        _transfer(_quoteToken, msg.sender, _quoteAmount);
    }

    function takePerformanceFee(
        address _token,
        uint256 _amount
    ) external onlyAllocator {
        // update stats
        profitFee += uint128(_amount);
        /* solhint-disable not-rely-on-time */
        blockTimestamp = uint128(block.timestamp);

        // transfer tokens from msg.sender to current contract
        _transferFrom(_token, msg.sender, address(this), _amount);
    }

    function takeWithdrawFee(
        address _token,
        uint256 _amount
    ) external onlyAllocator {
        // update stats
        withdrawFee += uint128(_amount);
        /* solhint-disable not-rely-on-time */
        blockTimestamp = uint128(block.timestamp);

        // transfer tokens from msg.sender to current contract
        _transferFrom(_token, msg.sender, address(this), _amount);
    }

    function approve(
        address _token,
        address _spender,
        uint256 _amount
    ) external onlyAllocator {
        IERC20(_token).approve(_spender, _amount);
    }

    /*//////////////////////////////////////////////////////////////
                        Public Helpers
    //////////////////////////////////////////////////////////////*/

    function getStats(
        address[] calldata _addrList
    )
        external
        view
        returns (
            uint256[] memory totalDeposits_,
            uint256[] memory totalWithdraws_,
            int256[] memory divergenceCover_,
            uint256 profitFee_,
            uint256 lossCover_,
            uint256 withdrawFee_,
            uint256 blockTimestamp_
        )
    {
        uint256 addrLength = _addrList.length;
        totalDeposits_ = new uint256[](addrLength);
        totalWithdraws_ = new uint256[](addrLength);
        divergenceCover_ = new int256[](addrLength);

        for (uint256 i = 0; i < addrLength; i++) {
            totalDeposits_[i] = totalDeposits[_addrList[i]];
            totalWithdraws_[i] = totalWithdraws[_addrList[i]];
            divergenceCover_[i] = divergenceCover[_addrList[i]];
        }

        profitFee_ = profitFee;
        lossCover_ = lossCover;
        withdrawFee_ = withdrawFee;
        blockTimestamp_ = blockTimestamp;
    }

    /*//////////////////////////////////////////////////////////////
                        Internal Helpers
    //////////////////////////////////////////////////////////////*/

    function _deposit(address _token, address _from, uint256 _amount) internal {
        // update stats
        totalDeposits[_token] += _amount;
        /* solhint-disable not-rely-on-time */
        blockTimestamp = uint128(block.timestamp);

        // transfer tokens from msg.sender to current contract
        _transferFrom(_token, _from, address(this), _amount);
    }

    function _withdraw(address _token, address _to, uint256 _amount) internal {
        // update stats
        totalWithdraws[_token] += _amount;
        /* solhint-disable not-rely-on-time */
        blockTimestamp = uint128(block.timestamp);

        // transfer tokens to msg.sender
        _transfer(_token, _to, _amount);
    }

    function _transferFrom(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        IERC20(_token).safeTransferFrom(_from, _to, _amount);
    }

    function _transfer(address _token, address _to, uint256 _amount) internal {
        IERC20(_token).safeTransfer(_to, _amount);
    }

    function _balanceOf(
        address _token,
        address _account
    ) internal view returns (uint256) {
        return IERC20(_token).balanceOf(_account);
    }
}
