// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC4626Fees} from "./ERC4626Fees.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @dev A dirty prototype vault with entry/exit fees and non-fungible
/// withdrawals
abstract contract ERC4626Nonfungible is ERC4626Fees {
    using Math for uint256;

    mapping(address => uint256) public deposited;

    // === Overrides ===
    //
    /// @dev
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        super._deposit(caller, receiver, assets, shares);

        deposited[receiver] += assets;
    }

    /// @dev
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal virtual override {
        super._withdraw(caller, receiver, owner, assets, shares);

        // XXX should revert if deposit receiver != an owner of same or less
        // assets
        deposited[owner] -= assets;
    }
}
