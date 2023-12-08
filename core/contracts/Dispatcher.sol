// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Router.sol";

contract Dispatcher is Router, Ownable {
    using SafeERC20 for IERC20;

    Acre acre;

    constructor(Acre _acre) Ownable(msg.sender) {
        acre = _acre;
    }

    function assetsHolder() public virtual override returns (address){
        return address(acre);
    }

    function sharesHolder() public virtual override returns (address){
        return address(this);
    }

    function migrateShares(IERC4626[] calldata _vaults) public onlyOwner {
        address newDispatcher = address(acre.dispatcher());

        for (uint i=0; i<_vaults.length; i++) {
            _vaults[i].transfer(newDispatcher, _vaults[i].balanceOf(address(this)));
        }
    }
}
