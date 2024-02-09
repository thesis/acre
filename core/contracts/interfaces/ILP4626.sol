// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {IMinimal4626} from "./IMinimal4626.sol";

interface ILP4626 is IMinimal4626 {
    function depositToken(
        address _token,
        uint256 _amount,
        address _receiver
    ) external returns (uint256 shares);

    function swapBaseToQuote(uint256 _amountIn) external;

    function baseToken() external view returns (address);

    function convert(
        uint256 _baseAmount,
        bool _baseToQuote
    ) external view returns (uint256);
}
