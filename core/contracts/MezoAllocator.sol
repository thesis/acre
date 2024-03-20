// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IMezoPortal {
    function deposit(address token, uint96 amount, uint32 lockPeriod) external;

    function withdraw(address token, uint256 depositId, uint96 amount) external;

    function depositCount() external view returns (uint256);
}

/// @notice MezoAllocator is a contract that routes tBTC to/from MezoPortal.
contract MezoAllocator is Ownable2Step {
    using SafeERC20 for IERC20;

    address public mezoPortal;
    /// tBTC token contract.
    IERC20 public immutable tbtc;
    /// Contract holding tBTC deposited by stakers.
    address public tbtcStorage;

    // Deposit ID -> Deposit Amount
    mapping(uint256 => uint256) public depositsById;
    // Deposit IDs
    uint256[] public deposits;

    event DepositAllocated(uint256 depositId, uint256 amount);

    constructor(address _mezoPortal, IERC20 _tbtc) Ownable(msg.sender) {
        mezoPortal = _mezoPortal;
        tbtc = _tbtc;
    }

    // TODO: replace onlyOwner with onlyMaintaier or onlyOwnerAndMaintainer.
    /// @notice Deposits tBTC to MezoPortal.
    /// @dev This function will be called by the bot at some interval.
    function deposit(uint96 amount) external onlyOwner {
        IERC20(tbtc).safeTransferFrom(tbtcStorage, address(this), amount);
        // 0 means no lock.
        IMezoPortal(mezoPortal).deposit(address(tbtc), amount, 0);
        // MezoPortal doesn't return depositId, so we have to read depositCounter
        // which assignes depositId to the current deposit.
        uint256 depositId = IMezoPortal(mezoPortal).depositCount();
        depositsById[depositId] = amount;
        deposits.push(depositId);

        emit DepositAllocated(depositId, amount);
    }

    /// @notice Updates the tBTC storage address.
    /// @dev At first this is going to be the stBTC contract. Once Acre
    ///      works with more destinations for tBTC, this will be updated to
    ///      the new storage contract like AcreDispatcher.
    /// @param _tbtcStorage Address of the new tBTC storage.
    function updateTbtcStorage(address _tbtcStorage) external onlyOwner {
        tbtcStorage = _tbtcStorage;
    }

    // TODO: add updatable withdrawer and onlyWithdrawer modifier (stBTC or AcreDispatcher).
    /// @notice Withdraws tBTC from MezoPortal and transfers it to stBTC.
    function withdraw(uint96 amount) external {
        // TODO: Take the latest deposit and pull funds from it.
        //       If not enough funds, take everything from that deposit and
        //       take the rest from the next deposit id until the amount is
        //       reached.
        // IMezoPortal(mezoPortal).withdraw(address(tbtc), depositId, amount);
        // TODO: update depositsById and deposits data structures.
        // IERC20(tbtc).safeTransfer(address(tbtcStorage), amount);
    }
}
