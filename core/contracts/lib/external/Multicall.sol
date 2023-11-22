// forked from https://github.com/Uniswap/v3-periphery/blob/main/contracts/base/Multicall.sol

// SPDX-License-Identifier: GPL-2.0-or-later

// Copied from https://github.com/ERC4626-Alliance/ERC4626-Contracts based on
// the project commit 643cd04 from Apr 20, 2022

pragma solidity >=0.7.6;

import './interfaces/IMulticall.sol';

/// @title Multicall
/// @notice Enables calling multiple methods in a single call to the contract
abstract contract Multicall is IMulticall {
    /// @inheritdoc IMulticall
    function multicall(bytes[] calldata data) public payable override returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);

            if (!success) {
                // Next 5 lines from https://ethereum.stackexchange.com/a/83577
                if (result.length < 68) revert();
                assembly {
                    result := add(result, 0x04)
                }
                revert(abi.decode(result, (string)));
            }

            results[i] = result;
        }
    }
}