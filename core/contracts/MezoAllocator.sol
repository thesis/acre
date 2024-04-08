// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ZeroAddress} from "./utils/Errors.sol";
import "./stBTC.sol";

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
    /// stBTC token vault contract.
    stBTC public immutable stbtc;
    /// @notice Maintainer address which can trigger deposit flow.
    address public maintainer;
    /// @notice Address that can withdraw tBTC from Mezo Portal.
    address public withdrawer;
    /// @notice keeps track of the latest deposit ID assigned in Mezo Portal.
    uint256 public depositId;

    /// Emitted when tBTC is deposited to MezoPortal.
    event DepositAllocated(
        uint256 indexed oldDepositId,
        uint256 indexed newDepositId,
        uint256 addedAmount,
        uint256 newDepositAmount
    );

    /// Emitted when tBTC is withdrawn from MezoPortal.
    event DepositWithdraw(uint256 indexed depositId, uint96 amount);

    /// @notice Emitted when the maintainer address is updated.
    event MaintainerUpdated(address indexed maintainer);

    /// @notice Emitted when the withdrawer address is updated.
    event WithdrawerUpdated(address indexed withdrawer);

    /// @notice Reverts if the caller is not an authorized account.
    error NotAuthorized();

    /// @notice Reverts if the caller tries to withdraw more tBTC than available.
    error InsufficientBalance();

    modifier onlyMaintainerAndOwner() {
        if (msg.sender != maintainer && owner() != msg.sender) {
            revert NotAuthorized();
        }
        _;
    }

    modifier onlyWithdrawer() {
        if (msg.sender != withdrawer) {
            revert NotAuthorized();
        }
        _;
    }

    /// @notice Initializes the MezoAllocator contract.
    /// @param _mezoPortal Address of the MezoPortal contract.
    /// @param _tbtc Address of the tBTC token contract.
    constructor(
        address _mezoPortal,
        IERC20 _tbtc,
        stBTC _stbtc
    ) Ownable(msg.sender) {
        if (_mezoPortal == address(0)) {
            revert ZeroAddress();
        }
        if (address(_tbtc) == address(0)) {
            revert ZeroAddress();
        }
        mezoPortal = IMezoPortal(_mezoPortal);
        tbtc = _tbtc;
        stbtc = _stbtc;
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
        uint256 addedAmount = tbtc.balanceOf(address(stbtc));
        // slither-disable-next-line arbitrary-send-erc20
        tbtc.safeTransferFrom(address(stbtc), address(this), addedAmount);

        uint96 newDepositAmount = uint96(tbtc.balanceOf(address(this)));

        tbtc.forceApprove(address(mezoPortal), newDepositAmount);
        // 0 denotes no lock period for this deposit.
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

    /// @notice Withdraws tBTC from MezoPortal and transfers it to stBTC.
    ///         This function can withdraw partial or a full amount of tBTC from
    ///         MezoPortal for a given deposit id.
    /// @param amount Amount of tBTC to withdraw.
    function withdraw(uint96 amount) external onlyWithdrawer {
        uint96 balance = mezoPortal
            .getDeposit(address(this), address(tbtc), depositId)
            .balance;
        if (amount > balance) {
            revert InsufficientBalance();
        }
        emit DepositWithdraw(depositId, amount);
        mezoPortal.withdraw(address(tbtc), depositId, amount);
        tbtc.safeTransfer(address(stbtc), amount);
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

    /// @notice Updates the withdrawer address.
    /// @param _withdrawer Address of the new withdrawer.
    function updateWithdrawer(address _withdrawer) external onlyOwner {
        if (_withdrawer == address(0)) {
            revert ZeroAddress();
        }
        withdrawer = _withdrawer;

        emit WithdrawerUpdated(_withdrawer);
    }
}
