// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import { IMinimal4626 } from './IMinimal4626.sol';
import { ILP4626 } from './ILP4626.sol';

interface IReserve {
  function performanceFeeRatio() external view returns (uint64);

  function withdrawFeeRatio() external view returns (uint64);

  function deposit(address _token, uint256 _amount) external;

  function withdraw(address _token, uint256 _amount) external;

  function coverLoss(address _token, uint256 _amount) external;

  function coverDivergence(
    address _baseToken,
    uint256 _baseAmount,
    address _quoteToken,
    uint256 _quoteAmount
  ) external;

  function takePerformanceFee(address _token, uint256 _amount) external;

  function takeWithdrawFee(address _token, uint256 _amount) external;

  function approve(address _token, address _spender, uint256 _amount) external;

  function allocate(
    ILP4626 _strategy,
    address _baseToken,
    uint256 _baseAmount,
    uint256 _quoteAmount,
    uint32 _baseRatio
  ) external;

  function free(IMinimal4626 _strategy) external;

  function swap(
    ILP4626 _strategy,
    address _quoteToken,
    uint256 _baseAmountDesired
  ) external returns (uint256 baseLeft);
}
