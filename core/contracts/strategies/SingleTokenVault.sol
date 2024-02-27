// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

// @notice For testing purposes only
contract SingleTokenVault is ERC4626 {
    using SafeERC20 for IERC20;

    constructor(
        IERC20 _tBTC,
        string memory _erc4626Name,
        string memory _erc4626Symbol
    ) ERC4626(_tBTC) ERC20(_erc4626Name, _erc4626Symbol) {}

    function free() external {}

    // NOTE: used for testing loss position in spec
    function transfer(uint256 _amountOut) external {
        IERC20(asset()).transfer(msg.sender, _amountOut);
    }

    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    function pricePerShare() public view returns (uint256) {
        return convertToAssets(1e18);
    }
}
