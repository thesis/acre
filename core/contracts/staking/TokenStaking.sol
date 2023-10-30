// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../shared/IReceiveApproval.sol";

/// @title TokenStaking
/// @notice A token staking contract for a specified standard ERC20 token. A
///         holder of the specified token can stake its tokens to this contract
///         and recover the stake after undelegation period is over.
contract TokenStaking is IReceiveApproval {
    using SafeERC20 for IERC20;

    event Staked(address indexed staker, uint256 amount);

    IERC20 internal immutable token;

    mapping(address => uint256) public balanceOf;

    constructor(IERC20 _token) {
        require(
            address(_token) != address(0),
            "Token can not be the zero address"
        );

        token = _token;
    }

    /// @notice Receives approval of token transfer and stakes the approved
    ///         amount or adds the approved amount to an existing stake.
    /// @dev Requires that the provided token contract be the same one linked to
    ///      this contract.
    /// @param from The owner of the tokens who approved them to transfer.
    /// @param amount Approved amount for the transfer and stake.
    /// @param _token Token contract address.
    function receiveApproval(
        address from,
        uint256 amount,
        address _token,
        bytes calldata
    ) external override {
        require(_token == address(token), "Unrecognized token");
        _stake(from, amount);
    }

    /// @notice Stakes the owner's tokens in the staking contract.
    /// @param amount Approved amount for the transfer and stake.
    function stake(uint256 amount) external {
        _stake(msg.sender, amount);
    }

    /// @notice Returns minimum amount of staking tokens to participate in
    ///         protocol.
    function minimumStake() public pure returns (uint256) {
        // TODO: Fetch this param from "parameters" contract that stores
        // governable params.
        return 1;
    }

    /// @notice Returns maximum amount of staking tokens.
    function maximumStake() public pure returns (uint256) {
        // TODO: Fetch this param from "parameters" contract that stores
        // governable params.
        return 100 ether;
    }

    function _stake(address staker, uint256 amount) private {
        require(amount >= minimumStake(), "Amount is less than minimum");
        require(amount <= maximumStake(), "Amount is greater than maxium");
        require(staker != address(0), "Can not be the zero address");

        balanceOf[staker] += amount;

        emit Staked(staker, amount);
        token.safeTransferFrom(staker, address(this), amount);
    }
}
