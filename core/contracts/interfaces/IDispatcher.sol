// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

interface IDispatcher {
    function withdraw(uint256 amount) external;
    function totalAssets() external view returns (uint256);
}
