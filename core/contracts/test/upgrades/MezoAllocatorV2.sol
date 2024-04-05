// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

interface IMezoPortal {
    function deposit(address token, uint96 amount, uint32 lockPeriod) external;

    function withdraw(address token, uint256 depositId, uint96 amount) external;

    function depositCount() external view returns (uint256);
}

/// @dev  This is a contract used to test stBTC upgradeability. It is a copy of
///       stBTC contract with some differences marked with `TEST:` comments.
contract MezoAllocatorV2 is Ownable2StepUpgradeable {
    using SafeERC20 for IERC20;

    /// @notice DepositInfo keeps track of the deposit Id, deposit balance,
    ///         creation time, and unlock time.
    struct DepositInfo {
        uint256 id;
        uint96 balance;
        uint32 createdAt;
        uint32 unlockAt;
    }

    /// Address of the MezoPortal contract.
    address public mezoPortal;
    /// tBTC token contract.
    IERC20 public tbtc;
    /// Contract holding tBTC deposited by stakers.
    address public tbtcStorage;

    /// @notice Maintainer address which can trigger deposit flow.
    address public maintainer;

    /// @notice keeps track of the deposit info.
    DepositInfo public depositInfo;

    // TEST: New variable.
    uint256 public newVariable;

    /// Emitted when tBTC is deposited to MezoPortal.
    event DepositAllocated(
        uint256 indexed oldDepositId,
        uint256 indexed newDepositId,
        uint256 amount
    );

    /// @notice Emitted when the tBTC storage address is updated.
    event TbtcStorageUpdated(address indexed tbtcStorage);

    /// @notice Emitted when the maintainer address is updated.
    event MaintainerUpdated(address indexed maintainer);

    // TEST: New event.
    event NewEvent();

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the MezoAllocator contract.
    /// @param _mezoPortal Address of the MezoPortal contract.
    /// @param _tbtc Address of the tBTC token contract.
    function initialize(address _mezoPortal, IERC20 _tbtc) public initializer {
        // TEST: Removed content of initialize function. Initialize shouldn't be
        //       called again during the upgrade because of the `initializer`
        //       modifier.
    }

    // TEST: Initializer for V2.
    function initializeV2(uint256 _newVariable) public reinitializer(2) {
        newVariable = _newVariable;
    }

    /// @notice Allocate tBTC to MezoPortal. Each allocation creates a new "rolling"
    ///         deposit meaning that the previous Acre's deposit is fully withdrawn
    ///         before a new deposit with added amount is created. This mimics a
    ///         "top up" functionality with the difference that a new deposit id
    ///         is created and the previous deposit id is no longer used.
    /// @dev This function can be invoked periodically by a bot.
    /// @param amount Amount of tBTC to deposit to Mezo Portal.
    function allocate(uint96 amount) external onlyMaintainerAndOwner {
        // Free all Acre's tBTC from MezoPortal before creating a new deposit.
        free();
        // slither-disable-next-line arbitrary-send-erc20
        IERC20(tbtc).safeTransferFrom(tbtcStorage, address(this), amount);

        // Add freed tBTC from the previous deposit and add the new amount.
        uint96 newBalance = depositInfo.balance + amount;

        IERC20(tbtc).forceApprove(mezoPortal, newBalance);
        // 0 denotes no lock period for this deposit. The zero lock time is
        // hardcoded as of biz decision.
        IMezoPortal(mezoPortal).deposit(address(tbtc), newBalance, 0);
        // MezoPortal doesn't return depositId, so we have to read depositCounter
        // which assignes depositId to the current deposit.
        uint256 newDepositId = IMezoPortal(mezoPortal).depositCount();
        // slither-disable-next-line reentrancy-benign
        uint256 oldDepositId = depositInfo.id;
        depositInfo.id = newDepositId;
        depositInfo.balance = newBalance;
        // solhint-disable-next-line not-rely-on-time
        depositInfo.createdAt = uint32(block.timestamp);
        // solhint-disable-next-line not-rely-on-time
        depositInfo.unlockAt = uint32(block.timestamp);

        // slither-disable-next-line reentrancy-events
        emit DepositAllocated(oldDepositId, newDepositId, amount);
    }

    /// @notice Updates the tBTC storage address.
    /// @dev At first this is going to be the stBTC contract. Once Acre
    ///      works with more destinations for tBTC, this will be updated to
    ///      the new storage contract like AcreDispatcher.
    /// @param _tbtcStorage Address of the new tBTC storage.
    // TEST: Modified function.
    function updateTbtcStorage(address _tbtcStorage) external onlyOwner {
        if (_tbtcStorage == address(0)) {
            revert ZeroAddress();
        }
        tbtcStorage = _tbtcStorage;

        emit TbtcStorageUpdated(_tbtcStorage);

        // TEST: Emit new event.
        emit NewEvent();
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

    /// @notice Withdraw all Acre's tBTC from MezoPortal.
    function free() private {
        if (depositInfo.balance > 0) {
            // slither-disable-next-line reentrancy-no-eth
            IMezoPortal(mezoPortal).withdraw(
                address(tbtc),
                depositInfo.id,
                depositInfo.balance
            );
        }
    }
}
