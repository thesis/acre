// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

import {IMinimal4626} from "./interfaces/IMinimal4626.sol";
import {ILP4626} from "./interfaces/ILP4626.sol";

import {stBTC} from "./stBTC.sol";
import {IReserve} from "./interfaces/IReserve.sol";

contract Allocator is Ownable {
    using SafeERC20 for IERC20;

    // Strategies
    struct Strategy {
        // additional reserve token that strategy is allowed to use
        address baseToken;
        // block timestamp of last allocate/free
        uint64 blockTimestamp;
        // percent of allocator assets allocated to strategy, 0 is inactive
        uint32 weight;
        // ratio of base token
        uint32 baseRatio;
        /*//////////////////////////////////////////////////////////////
                        allocate/free related
        //////////////////////////////////////////////////////////////*/

        // current total asset after each allocate/free
        uint96 totalAssets;
        /*//////////////////////////////////////////////////////////////
                        settlement related
        //////////////////////////////////////////////////////////////*/
        uint128 lastTotalAssets;
        int128 netFlow;
        // strategy last pricePerShare from last allocate/free
        uint128 pricePerShare;
    }

    IERC20 public immutable tbtcToken;
    stBTC public immutable stbtc;
    IReserve public reserve;

    uint128 public lastTotalAssets;

    IMinimal4626[] public strategyList;
    mapping(IMinimal4626 => Strategy) public strategies;

    event Settlement(
        uint256 indexed blockNumber,
        uint128 lastTotalAssets,
        int256 netPerformance,
        uint256 performanceFee,
        uint256 lossCover,
        uint256 divergenceCover
    );

    constructor(
        IERC20 _tBTC,
        stBTC _stBTC,
        IReserve _reserve
    ) Ownable(msg.sender) {
        tbtcToken = _tBTC;
        stbtc = _stBTC;
        reserve = _reserve;
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN ONLY
    //////////////////////////////////////////////////////////////*/

    function addStrategy(
        IMinimal4626 _strategy,
        Strategy memory _strategyData
    ) external onlyOwner {
        require(address(_strategy) != address(0), "ZERO_ADDRESS");
        require(
            strategies[_strategy].baseToken == address(0),
            "STRATEGY_EXISTS"
        );
        strategyList.push(_strategy);
        /* solhint-disable-next-line not-rely-on-time */
        _strategyData.blockTimestamp = uint64(block.timestamp);
        strategies[_strategy] = _strategyData;

        /*=============================================
                    LP4626 Specific
         =============================================*/
        if (_strategyData.baseRatio > 0) {
            _approve(
                _strategyData.baseToken,
                address(_strategy),
                type(uint256).max
            );
            reserve.approve(
                _strategyData.baseToken,
                address(_strategy),
                type(uint256).max
            );
            _approve(
                _strategyData.baseToken,
                address(reserve),
                type(uint256).max
            );
        }
        /*==========/ LP4626 Specific =================*/
    }

    function updateStrategy(
        IMinimal4626 _strategy,
        Strategy memory _strategyData
    ) external onlyOwner {
        require(address(_strategy) != address(0), "ZERO_ADDRESS");
        address baseToken = strategies[_strategy].baseToken;
        require(baseToken != address(0), "STRATEGY_ABSENT");

        /* solhint-disable-next-line not-rely-on-time */
        _strategyData.blockTimestamp = uint64(block.timestamp);
        strategies[_strategy] = _strategyData;
    }

    function settle() external onlyOwner {
        // 1. collect all unclaimed rewards & free all reserve assets
        (uint256[][] memory amountsList, int256 netPerformance) = _free();

        // 2. profit settlement
        uint256 performanceFee;
        uint256 lossCover;
        uint256 divergenceCover;
        (performanceFee, lossCover, divergenceCover, amountsList) = _settle(
            amountsList,
            netPerformance
        );

        // 3. syncRewards
        stbtc.syncRewards();

        // 4. re-allocate all assets
        _allocate(amountsList, true);

        // 5. reset settlement deltas
        for (uint256 i; i < amountsList.length; i++) {
            strategies[strategyList[i]].netFlow = 0;
        }

        emit Settlement(
            block.number,
            lastTotalAssets,
            netPerformance,
            performanceFee,
            lossCover,
            divergenceCover
        );
    }

    /*//////////////////////////////////////////////////////////////
                        stBTC ONLY
    //////////////////////////////////////////////////////////////*/

    function withdraw(uint256 _assets, address _receiver) external {
        require(msg.sender == address(stbtc), "ONLY_STBTC");
        (uint256[][] memory amountsList, ) = _free();

        // exchange base tokens to tbtcToken if needed
        uint256 tBTCBalance = _balanceOf(address(tbtcToken), address(this));
        if (tBTCBalance < _assets) {
            _swap(amountsList);
            amountsList = new uint256[][](0);
        }

        uint256 fee;
        uint256 withdrawFeeRatio = reserve.withdrawFeeRatio();
        if (withdrawFeeRatio > 0) {
            fee = (_assets * withdrawFeeRatio) / 10_000;
            tbtcToken.approve(address(reserve), fee);
            reserve.takeWithdrawFee(address(tbtcToken), fee);
        }
        tBTCBalance = _balanceOf(address(tbtcToken), address(this));
        uint256 withdrawAmount = _assets - fee;
        if (tBTCBalance < withdrawAmount) withdrawAmount = tBTCBalance;
        _transfer(address(tbtcToken), _receiver, withdrawAmount);

        _allocate(amountsList, false);
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN or stBTC ONLY
    //////////////////////////////////////////////////////////////*/

    function allocate() external {
        require(
            msg.sender == owner() || msg.sender == address(stbtc),
            "UNAUTHORIZED"
        );
        _allocate(new uint256[][](0), false);
    }

    function free() external {
        require(
            msg.sender == owner() || msg.sender == address(stbtc),
            "UNAUTHORIZED"
        );
        (uint256[][] memory amountsList, ) = _free();
        _swap(amountsList);
    }

    /*//////////////////////////////////////////////////////////////
                        Public Methods
    //////////////////////////////////////////////////////////////*/

    function strategyLength() external view returns (uint256) {
        return strategyList.length;
    }

    function totalAssets() public view returns (uint256 totalAmount) {
        // current strategy totalAssets
        for (uint256 i = 0; i < strategyList.length; i++) {
            totalAmount += strategyList[i].totalAssets();
        }

        // unused quote token in allocator
        totalAmount += _balanceOf(address(tbtcToken), address(this));
    }

    /*//////////////////////////////////////////////////////////////
                        Internal Helpers
    //////////////////////////////////////////////////////////////*/

    function _allocate(
        uint256[][] memory amountsList,
        bool _settlement
    ) internal {
        uint256 totalWeight = _totalWeight();
        if (totalWeight == 0) return;

        uint256 totalQuoteAmount = _balanceOf(
            address(tbtcToken),
            address(this)
        );

        for (uint256 i = 0; i < strategyList.length; i++) {
            IMinimal4626 strategy = strategyList[i];
            bool isMinimalStrategy = strategies[strategy].baseRatio == 0;
            Strategy storage strategyInfo = strategies[strategy];
            uint256 quoteAmount = (totalQuoteAmount * strategyInfo.weight) /
                totalWeight;

            if (quoteAmount > 0) {
                // allocate allocator's quote token to strategy
                _approve(address(tbtcToken), address(strategy), quoteAmount);
                strategy.deposit(quoteAmount, address(this));
            }

            if (isMinimalStrategy) {
                if (quoteAmount == 0) continue;
                strategyInfo.netFlow += int128(int256(quoteAmount));
                if (_settlement) {
                    strategyInfo.lastTotalAssets = uint128(
                        strategy.totalAssets()
                    );
                }
            } else {
                /*=============================================
                        LP4626 Specific
                 =============================================*/
                uint256 baseAmount = amountsList.length > 0
                    ? amountsList[i][1]
                    : 0;
                if (quoteAmount == 0 && baseAmount == 0) continue;

                ILP4626 lpStrategy = ILP4626(address(strategy));
                address baseToken = lpStrategy.baseToken();

                // allocate allocator's base token to strategy if needed
                if (baseAmount > 0) {
                    lpStrategy.depositToken(
                        baseToken,
                        baseAmount,
                        address(this)
                    );
                    strategyInfo.netFlow += int128(
                        int256(
                            quoteAmount + lpStrategy.convert(baseAmount, true)
                        )
                    );
                } else {
                    strategyInfo.netFlow += int128(int256(quoteAmount));
                }
                if (_settlement) {
                    strategyInfo.lastTotalAssets = uint128(
                        strategy.totalAssets()
                    );
                }

                // allocate reserve's base token to strategy
                reserve.allocate(
                    lpStrategy,
                    baseToken,
                    baseAmount,
                    quoteAmount,
                    strategyInfo.baseRatio
                );
                /*==========/ LP4626 Specific =================*/
            }

            // update strategy records
            strategyInfo.totalAssets = uint96(strategy.totalAssets());
            strategyInfo.pricePerShare = uint128(strategy.pricePerShare());
            /* solhint-disable-next-line not-rely-on-time */
            strategyInfo.blockTimestamp = uint64(block.timestamp);
        }
    }

    function _free()
        internal
        returns (uint256[][] memory amountsList, int256 netPerformance)
    {
        amountsList = new uint256[][](strategyList.length);
        for (uint256 i = 0; i < strategyList.length; i++) {
            IMinimal4626 strategy = strategyList[i];
            // calculate compareTotalAsset
            int256 compareTotalAsset = int256(
                uint256(strategies[strategy].lastTotalAssets)
            ) + strategies[strategy].netFlow;

            // free all positions
            strategy.free();

            // redeem allocator tokens
            uint256 allocatorShares = strategy.maxRedeem(address(this));
            if (allocatorShares > 0) {
                bool isMinimalStrategy = strategies[strategy].baseRatio == 0;
                int256 currentTotalAsset;
                uint256[] memory amounts = new uint256[](
                    isMinimalStrategy ? 1 : 2
                );
                amounts[0] = _balanceOf(address(tbtcToken), address(this));

                if (isMinimalStrategy) {
                    strategy.redeem(
                        allocatorShares,
                        address(this),
                        address(this)
                    );
                    amounts[0] =
                        _balanceOf(address(tbtcToken), address(this)) -
                        amounts[0];
                    currentTotalAsset = int256(amounts[0]);
                } else {
                    /*=============================================
                                  LP4626 Specific
                     =============================================*/
                    ILP4626 lpStrategy = ILP4626(address(strategy));
                    address baseTokenAddr = lpStrategy.baseToken();
                    amounts[1] = _balanceOf(baseTokenAddr, address(this));
                    strategy.redeem(
                        allocatorShares,
                        address(this),
                        address(this)
                    );
                    amounts[0] =
                        _balanceOf(address(tbtcToken), address(this)) -
                        amounts[0];
                    amounts[1] =
                        _balanceOf(baseTokenAddr, address(this)) -
                        amounts[1];
                    currentTotalAsset = int256(
                        amounts[0] + lpStrategy.convert(amounts[1], true)
                    );
                    /*==========/ LP4626 Specific =================*/
                }

                amountsList[i] = amounts;
                strategies[strategy].netFlow -= int128(
                    int256(currentTotalAsset)
                );
                netPerformance += (currentTotalAsset - compareTotalAsset);
            }

            // redeem reserve tokens
            reserve.free(strategy);

            // update strategy records
            strategies[strategy].totalAssets = uint96(strategy.totalAssets());
            strategies[strategy].pricePerShare = uint128(
                strategy.pricePerShare()
            );
            /* solhint-disable-next-line not-rely-on-time */
            strategies[strategy].blockTimestamp = uint64(block.timestamp);
        }
    }

    function _settle(
        uint256[][] memory amountsList,
        int256 netPerformance
    )
        internal
        returns (
            uint256 performanceFee_,
            uint256 lossCover_,
            uint256 divergenceCover_,
            uint256[][] memory amountsList_
        )
    {
        amountsList_ = amountsList;

        // in profit
        if (netPerformance > 0) {
            // reserve takes a performance fee when profitable
            performanceFee_ =
                (uint256(netPerformance) * reserve.performanceFeeRatio()) /
                10_000;
            if (performanceFee_ > 0) {
                _approve(address(tbtcToken), address(reserve), performanceFee_);
                reserve.takePerformanceFee(address(tbtcToken), performanceFee_);
            }
        } else if (netPerformance < 0) {
            // reserve covers the loss if needed
            lossCover_ = _reserveCoverage(uint256(-netPerformance));

            /*=============================================
                      LP4626 Specific
            =============================================*/
            // reserve covers the divergence if needed
            for (uint256 i; i < amountsList.length; i++) {
                bool isMinimalStrategy = strategies[strategyList[i]]
                    .baseRatio == 0;
                if (isMinimalStrategy) continue;

                ILP4626 lpStrategy = ILP4626(address(strategyList[i]));
                address baseToken = lpStrategy.baseToken();
                if (amountsList[i][1] == 0) continue;

                uint256 baseTotal = ((amountsList[i][1] +
                    lpStrategy.convert(amountsList[i][0], false)) *
                    strategies[lpStrategy].baseRatio) / 10_000;
                if (amountsList[i][1] <= baseTotal) continue;

                // reserve transfers quote token to strategy
                // strategy transfers base token to reserve
                uint256 baseAmount = amountsList[i][1] - baseTotal;
                uint256 quoteAmount = lpStrategy.convert(baseAmount, true);
                if (
                    _balanceOf(address(tbtcToken), address(reserve)) >
                    quoteAmount
                ) {
                    _transfer(baseToken, address(reserve), baseAmount);
                    reserve.coverDivergence(
                        baseToken,
                        baseAmount,
                        address(tbtcToken),
                        quoteAmount
                    );
                    divergenceCover_ = quoteAmount;
                    amountsList_[i][1] -= baseAmount;
                }
            }
            /*==========/ LP4626 Specific =================*/
        }

        uint256 currTotalAssets = totalAssets();

        /*=============================================
                    LP4626 Specific
        =============================================*/
        // adding unused strategy base token into current totalAssets
        for (uint256 i; i < amountsList.length; i++) {
            bool isMinimalStrategy = strategies[strategyList[i]].baseRatio == 0;
            if (isMinimalStrategy) continue;

            if (strategies[strategyList[i]].baseRatio > 0) {
                // unused strategy base token in allocator
                if (amountsList[i][1] > 0) {
                    currTotalAssets += ILP4626(address(strategyList[i]))
                        .convert(amountsList[i][1], true);
                }
            }
        }
        /*==========/ LP4626 Specific =================*/

        // additional totalAssets check after loss cover & divergence cover
        if (netPerformance < 0) {
            uint256 stBTCTotalAssets = stbtc.totalAssets();
            if (stBTCTotalAssets > currTotalAssets) {
                uint256 coverAmount = _reserveCoverage(
                    stBTCTotalAssets - currTotalAssets
                );
                lossCover_ += coverAmount;
                currTotalAssets += coverAmount;
            }
        }

        lastTotalAssets = uint96(currTotalAssets);
    }

    /*=============================================
                LP4626 Specific
    =============================================*/
    // - swap base to quote from reserve first
    // - swap via v3Pool if needed
    function _swap(uint256[][] memory amountsList) internal {
        for (uint256 i = 0; i < amountsList.length; i++) {
            ILP4626 lpStrategy = ILP4626(address(strategyList[i]));
            uint256 baseAmount = amountsList[i][1];
            if (baseAmount > 0) {
                uint256 baseLeft = reserve.swap(
                    lpStrategy,
                    address(tbtcToken),
                    baseAmount
                );
                // swap base token to quote token via uniswap v3 pool
                if (baseLeft > 0) {
                    _transfer(
                        lpStrategy.baseToken(),
                        address(lpStrategy),
                        baseLeft
                    );
                    lpStrategy.swapBaseToQuote(baseLeft);
                }
            }
        }
    }

    /*==========/ LP4626 Specific =================*/

    // reserve covers the loss if possible
    function _reserveCoverage(
        uint256 _lossAmount
    ) internal returns (uint256 lossCover) {
        uint256 reserveBalance = _balanceOf(
            address(tbtcToken),
            address(reserve)
        );
        if (reserveBalance > _lossAmount) {
            reserve.coverLoss(address(tbtcToken), _lossAmount);
            lossCover = _lossAmount;
        }
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

    function _approve(
        address _token,
        address _spender,
        uint256 _amount
    ) internal {
        IERC20(_token).approve(_spender, _amount);
    }

    function _totalWeight() internal view returns (uint256 totalWeight) {
        for (uint256 i = 0; i < strategyList.length; i++) {
            totalWeight += strategies[strategyList[i]].weight;
        }
    }

    function _balanceOf(
        address _token,
        address _account
    ) internal view returns (uint256) {
        return IERC20(_token).balanceOf(_account);
    }
}
