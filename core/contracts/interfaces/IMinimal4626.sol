// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

interface IMinimal4626 {
    function deposit(
        uint256 assets,
        address receiver
    ) external returns (uint256 shares);

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) external returns (uint256 assets);

    function free() external;

    function totalAssets() external view returns (uint256);

    function pricePerShare() external view returns (uint256);

    function maxRedeem(address owner) external view returns (uint256);
}
