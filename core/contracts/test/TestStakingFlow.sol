// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TestERC4626} from "./TestERC4626.sol";

contract TestStakingFlow {
    TestERC4626 public immutable stbtc;
    bool public shouldRevertStaking = false;
    mapping(uint256 => bool) public finalizedStakes;
    mapping(uint256 => bool) public queuedStakes;

    event OptimisticMintingFinalized(
        address indexed minter,
        uint256 indexed depositKey,
        address indexed depositor,
        uint256 optimisticMintingDebt
    );

    event StakeRequestFinalized(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 stakedAmount
    );

    event StakeRequestQueued(
        uint256 indexed depositKey,
        address indexed caller,
        uint256 queuedAmount
    );

    constructor(address _stbtc) {
        stbtc = TestERC4626(_stbtc);
    }

    function finalizeMinting(uint256 depositKey) external {
        emit OptimisticMintingFinalized(
            address(0),
            depositKey,
            address(this),
            100
        );
    }

    function finalizeStake(uint256 depositKey) external {
        if (shouldRevertStaking) {
            stbtc.throwERC4626ExceededMaxDeposit(msg.sender);
        }

        finalizedStakes[depositKey] = true;

        emit StakeRequestFinalized(depositKey, msg.sender, 1000);
    }

    function queueStake(uint256 depositKey) external {
        queuedStakes[depositKey] = true;

        emit StakeRequestQueued(depositKey, msg.sender, 1000);
    }

    function setShouldRevertStaking(bool value) external {
        shouldRevertStaking = value;
    }
}
