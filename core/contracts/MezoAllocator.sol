// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ZeroAddress} from "./utils/Errors.sol";

interface IMezoPortal {
    struct DepositInfo {
        uint96 balance;
        uint32 unlockAt;
    }

    function deposit(address token, uint96 amount, uint32 lockPeriod) external;

    function withdraw(address token, uint256 depositId, uint96 amount) external;

    function depositCount() external view returns (uint256);

    function getDeposit(
        address depositor,
        address token,
        uint256 depositId
    ) external view returns (DepositInfo memory);
}

/// @notice MezoAllocator routes tBTC to/from MezoPortal.
contract MezoAllocator is Ownable2Step {
    using SafeERC20 for IERC20;

    /// Address of the MezoPortal contract.
    IMezoPortal public immutable mezoPortal;
    /// tBTC token contract.
    IERC20 public immutable tbtc;
    /// Contract holding tBTC deposited by stakers.
    address public tbtcStorage;
    /// @notice Maintainer address which can trigger deposit flow.
    address public maintainer;
    /// @notice keeps track of the latest deposit ID assigned in Mezo Portal.
    uint256 public depositId;

    /// Emitted when tBTC is deposited to MezoPortal.
    event DepositAllocated(
        uint256 indexed oldDepositId,
        uint256 indexed newDepositId,
        uint256 addedAmount,
        uint256 newDepositAmount
    );

    /// @notice Emitted when the tBTC storage address is updated.
    event TbtcStorageUpdated(address indexed tbtcStorage);

    /// @notice Emitted when the maintainer address is updated.
    event MaintainerUpdated(address indexed maintainer);

    /// @notice Reverts if the caller is not an authorized account.
    error NotAuthorized();

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
        mezoPortal = IMezoPortal(_mezoPortal);
        tbtc = _tbtc;
    }

    /// @notice Allocate tBTC to MezoPortal. Each allocation creates a new "rolling"
    ///         deposit meaning that the previous Acre's deposit is fully withdrawn
    ///         before a new deposit with added amount is created. This mimics a
    ///         "top up" functionality with the difference that a new deposit id
    ///         is created and the previous deposit id is no longer in use.
    /// @dev This function can be invoked periodically by a bot.
    function allocate() external onlyMaintainerAndOwner {
        uint96 depositBalance = mezoPortal
            .getDeposit(address(this), address(tbtc), depositId)
            .balance;
        if (depositBalance > 0) {
            // Free all Acre's tBTC from MezoPortal before creating a new deposit.
            // slither-disable-next-line reentrancy-no-eth
            mezoPortal.withdraw(address(tbtc), depositId, depositBalance);
        }
        uint256 addedAmount = IERC20(tbtc).balanceOf(address(tbtcStorage));
        // slither-disable-next-line arbitrary-send-erc20
        IERC20(tbtc).safeTransferFrom(tbtcStorage, address(this), addedAmount);

        uint96 newDepositAmount = uint96(IERC20(tbtc).balanceOf(address(this)));

        IERC20(tbtc).forceApprove(address(mezoPortal), newDepositAmount);
        // 0 denotes no lock period for this deposit. The zero lock time is
        // hardcoded as of biz decision.
        mezoPortal.deposit(address(tbtc), newDepositAmount, 0);
        uint256 oldDepositId = depositId;
        // MezoPortal doesn't return depositId, so we have to read depositCounter
        // which assigns depositId to the current deposit.
        depositId = mezoPortal.depositCount();

        // slither-disable-next-line reentrancy-events
        emit DepositAllocated(
            oldDepositId,
            depositId,
            addedAmount,
            newDepositAmount
        );
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
