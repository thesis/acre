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

    event Staked(address indexed account, uint256 amount);

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

    function _stake(address account, uint256 amount) private {
        require(amount > 0, "Amount is less than minimum");
        require(account != address(0), "Can not be the zero address");

        balanceOf[account] += amount;

        emit Staked(account, amount);
        token.safeTransferFrom(account, address(this), amount);
    }
}
