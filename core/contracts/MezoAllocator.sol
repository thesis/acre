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

/// @notice MezoAllocator routes tBTC to/from MezoPortal.
contract MezoAllocator is Ownable2Step {
    using SafeERC20 for IERC20;

    /// @notice DepositInfo keeps track of the deposit balance, creation time,
    ///         and unlock time.
    struct DepositInfo {
        uint96 balance;
        uint32 createdAt;
        uint32 unlockAt;
    }

    /// Address of the MezoPortal contract.
    address public immutable mezoPortal;
    /// tBTC token contract.
    IERC20 public immutable tbtc;
    /// Contract holding tBTC deposited by stakers.
    address public tbtcStorage;

    /// @notice Maintainer address which can trigger deposit flow.
    address public maintainer;

    // Deposit ID -> Deposit Info
    mapping(uint256 => DepositInfo) public depositsById;
    // Deposit IDs
    uint256[] public deposits;

    /// Emitted when tBTC is deposited to MezoPortal.
    event DepositAllocated(uint256 depositId, uint256 amount);

    /// @notice Emitted when the tBTC storage address is updated.
    event TbtcStorageUpdated(address indexed tbtcStorage);

    /// @notice Emitted when the maintainer address is updated.
    event MaintainerUpdated(address indexed maintainer);

    /// @notice Reverts if the caller is not an authorized account.
    error NotAuthorized();

    /// @notice Reverts if the address is 0.
    error ZeroAddress();

    modifier onlyMaintainerAndOwner() {
        if (msg.sender != maintainer && owner() != msg.sender) {
            revert NotAuthorized();
        }
        _;
    }

    /// @notice Initializes the MezoAllocator contract.
    /// @param _mezoPortal Address of the MezoPortal contract.
    /// @param _tbtc Address of the tBTC token contract.
    constructor(address _mezoPortal, IERC20 _tbtc) Ownable(msg.sender) {
        if (_mezoPortal == address(0)) {
            revert ZeroAddress();
        }
        if (address(_tbtc) == address(0)) {
            revert ZeroAddress();
        }
        mezoPortal = _mezoPortal;
        tbtc = _tbtc;
    }

    /// @notice Deposits tBTC to MezoPortal.
    /// @dev This function can be invoked periodically by a bot.
    /// @param amount Amount of tBTC to deposit to Mezo Portal.
    function deposit(uint96 amount) external onlyMaintainerAndOwner {
        // slither-disable-next-line arbitrary-send-erc20
        IERC20(tbtc).safeTransferFrom(tbtcStorage, address(this), amount);
        IERC20(tbtc).forceApprove(mezoPortal, amount);
        // 0 denotes no lock period for this deposit. The zero lock time is
        // hardcoded as of biz decision. 
        IMezoPortal(mezoPortal).deposit(address(tbtc), amount, 0);
        // MezoPortal doesn't return depositId, so we have to read depositCounter
        // which assignes depositId to the current deposit.
        uint256 depositId = IMezoPortal(mezoPortal).depositCount();
        // slither-disable-next-line reentrancy-benign
        depositsById[depositId] = DepositInfo({
            balance: amount,
            createdAt: uint32(block.timestamp),
            unlockAt: uint32(block.timestamp)
        });
        deposits.push(depositId);

        // slither-disable-next-line reentrancy-events
        emit DepositAllocated(depositId, amount);
    }

    /// @notice Updates the tBTC storage address.
    /// @dev At first this is going to be the stBTC contract. Once Acre
    ///      works with more destinations for tBTC, this will be updated to
    ///      the new storage contract like AcreDispatcher.
    /// @param _tbtcStorage Address of the new tBTC storage.
    function updateTbtcStorage(address _tbtcStorage) external onlyOwner {
        if (_tbtcStorage == address(0)) {
            revert ZeroAddress();
        }
        tbtcStorage = _tbtcStorage;

        emit TbtcStorageUpdated(_tbtcStorage);
    }

    /// @notice Updates the maintainer address.
    /// @param _maintainer Address of the new maintainer.
    function updateMaintainer(address _maintainer) external onlyOwner {
        if (_maintainer == address(0)) {
            revert ZeroAddress();
        }
        maintainer = _maintainer;

        emit MaintainerUpdated(_maintainer);
    }

    /// @notice Returns the deposit IDs.
    function getDeposits() external view returns (uint256[] memory) {
        return deposits;
    }

    // TODO: add updatable withdrawer and onlyWithdrawer modifier (stBTC or AcreDispatcher).
    /// @notice Withdraws tBTC from MezoPortal and transfers it to stBTC.
    function withdraw(uint96 amount) external {
        // TODO: Take the last deposit and pull the funds from it (FIFO).
        //       If not enough funds, take everything from that deposit and
        //       take the rest from the next deposit id until the amount is
        //       reached. Delete deposit ids that are empty.
        // IMezoPortal(mezoPortal).withdraw(address(tbtc), depositId, amount);
        // TODO: update depositsById and deposits data structures.
        // IERC20(tbtc).safeTransfer(address(tbtcStorage), amount);
    }
}
