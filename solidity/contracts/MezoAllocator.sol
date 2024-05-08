// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {ZeroAddress} from "./utils/Errors.sol";
import "./stBTC.sol";
import "./interfaces/IDispatcher.sol";

/// @title IMezoPortal
/// @dev Interface for the Mezo's Portal contract.
interface IMezoPortal {
    /// @notice DepositInfo keeps track of the deposit balance and unlock time.
    ///         Each deposit is tracked separately and associated with a specific
    ///         token. Some tokens can be deposited but can not be locked - in
    ///         that case the unlockAt is the block timestamp of when the deposit
    ///         was created. The same is true for tokens that can be locked but
    ///         the depositor decided not to lock them.
    struct DepositInfo {
        uint96 balance;
        uint32 unlockAt;
    }

    /// @notice Deposit and optionally lock tokens for the given period.
    /// @dev Lock period will be normalized to weeks. If non-zero, it must not
    ///      be shorter than the minimum lock period and must not be longer than
    ///      the maximum lock period.
    /// @param token token address to deposit
    /// @param amount amount of tokens to deposit
    /// @param lockPeriod lock period in seconds, 0 to not lock the deposit
    function deposit(address token, uint96 amount, uint32 lockPeriod) external;

    /// @notice Withdraw deposited tokens.
    ///         Deposited lockable tokens can be withdrawn at any time if
    ///         there is no lock set on the deposit or the lock period has passed.
    ///         There is no way to withdraw locked deposit. Tokens that are not
    ///         lockable can be withdrawn at any time. Deposit can be withdrawn
    ///         partially.
    /// @param token deposited token address
    /// @param depositId id of the deposit
    /// @param amount amount of the token to be withdrawn from the deposit
    function withdraw(address token, uint256 depositId, uint96 amount) external;

    /// @notice The number of deposits created. Includes the deposits that
    ///         were fully withdrawn. This is also the identifier of the most
    ///         recently created deposit.
    function depositCount() external view returns (uint256);

    /// @notice Get the balance and unlock time of a given deposit.
    /// @param depositor depositor address
    /// @param token token address to get the balance
    /// @param depositId id of the deposit
    function getDeposit(
        address depositor,
        address token,
        uint256 depositId
    ) external view returns (DepositInfo memory);
}

/// @notice MezoAllocator routes tBTC to/from MezoPortal.
contract MezoAllocator is IDispatcher, Ownable2StepUpgradeable {
    using SafeERC20 for IERC20;

    /// @notice Address of the MezoPortal contract.
    IMezoPortal public mezoPortal;
    /// @notice tBTC token contract.
    IERC20 public tbtc;
    /// @notice stBTC token vault contract.
    stBTC public stbtc;
    /// @notice Keeps track of the addresses that are allowed to trigger deposit
    ///         allocations.
    mapping(address => bool) public isMaintainer;
    /// @notice List of maintainers.
    address[] public maintainers;
    /// @notice keeps track of the latest deposit ID assigned in Mezo Portal.
    uint256 public depositId;
    /// @notice Keeps track of the total amount of tBTC allocated to MezoPortal.
    uint96 public depositBalance;

    /// @notice Emitted when tBTC is deposited to MezoPortal.
    event DepositAllocated(
        uint256 indexed oldDepositId,
        uint256 indexed newDepositId,
        uint256 addedAmount,
        uint256 newDepositAmount
    );
    /// @notice Emitted when tBTC is withdrawn from MezoPortal.
    event DepositWithdrawn(uint256 indexed depositId, uint256 amount);
    /// @notice Emitted when the maintainer address is updated.
    event MaintainerAdded(address indexed maintainer);
    /// @notice Emitted when the maintainer address is updated.
    event MaintainerRemoved(address indexed maintainer);
    /// @notice Emitted when tBTC is released from MezoPortal.
    event DepositReleased(uint256 indexed depositId, uint256 amount);
    /// @notice Reverts if the caller is not a maintainer.
    error CallerNotMaintainer();
    /// @notice Reverts if the caller is not the stBTC contract.
    error CallerNotStbtc();
    /// @notice Reverts if the maintainer is not registered.
    error MaintainerNotRegistered();
    /// @notice Reverts if the maintainer has been already registered.
    error MaintainerAlreadyRegistered();

    modifier onlyMaintainer() {
        if (!isMaintainer[msg.sender]) {
            revert CallerNotMaintainer();
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
    function initialize(
        address _mezoPortal,
        address _tbtc,
        address _stbtc
    ) public initializer {
        __Ownable2Step_init();
        __Ownable_init(msg.sender);

        if (_mezoPortal == address(0)) {
            revert ZeroAddress();
        }
        if (_tbtc == address(0)) {
            revert ZeroAddress();
        }
        if (address(_stbtc) == address(0)) {
            revert ZeroAddress();
        }

        mezoPortal = IMezoPortal(_mezoPortal);
        tbtc = IERC20(_tbtc);
        stbtc = stBTC(_stbtc);
    }

    /// @notice Allocate tBTC to MezoPortal. Each allocation creates a new "rolling"
    ///         deposit meaning that the previous Acre's deposit is fully withdrawn
    ///         before a new deposit with added amount is created. This mimics a
    ///         "top up" functionality with the difference that a new deposit id
    ///         is created and the previous deposit id is no longer in use.
    /// @dev This function can be invoked periodically by a maintainer.
    function allocate() external onlyMaintainer {
        if (depositBalance > 0) {
            // Free all Acre's tBTC from MezoPortal before creating a new deposit.
            // slither-disable-next-line reentrancy-no-eth
            mezoPortal.withdraw(address(tbtc), depositId, depositBalance);
        }

        // Fetch unallocated tBTC from stBTC contract.
        uint256 addedAmount = tbtc.balanceOf(address(stbtc));
        // slither-disable-next-line arbitrary-send-erc20
        tbtc.safeTransferFrom(address(stbtc), address(this), addedAmount);

        // Create a new deposit in the MezoPortal.
        depositBalance = uint96(tbtc.balanceOf(address(this)));
        tbtc.forceApprove(address(mezoPortal), depositBalance);
        // 0 denotes no lock period for this deposit.
        mezoPortal.deposit(address(tbtc), depositBalance, 0);
        uint256 oldDepositId = depositId;
        // MezoPortal doesn't return depositId, so we have to read depositCounter
        // which assigns depositId to the current deposit.
        depositId = mezoPortal.depositCount();

        // slither-disable-next-line reentrancy-events
        emit DepositAllocated(
            oldDepositId,
            depositId,
            addedAmount,
            depositBalance
        );
    }

    /// @notice Withdraws tBTC from MezoPortal and transfers it to stBTC.
    ///         This function can withdraw partial or a full amount of tBTC from
    ///         MezoPortal for a given deposit id.
    /// @param amount Amount of tBTC to withdraw.
    function withdraw(uint256 amount) external {
        if (msg.sender != address(stbtc)) revert CallerNotStbtc();

        emit DepositWithdrawn(depositId, amount);
        mezoPortal.withdraw(address(tbtc), depositId, uint96(amount));
        // slither-disable-next-line reentrancy-benign
        depositBalance -= uint96(amount);
        tbtc.safeTransfer(address(stbtc), amount);
    }

    /// @notice Releases deposit in full from MezoPortal.
    /// @dev This is a special function that can be used to migrate funds during
    ///      allocator upgrade or in case of emergencies.
    function releaseDeposit() external onlyOwner {
        uint96 amount = mezoPortal
            .getDeposit(address(this), address(tbtc), depositId)
            .balance;

        emit DepositReleased(depositId, amount);
        depositBalance = 0;
        mezoPortal.withdraw(address(tbtc), depositId, amount);
        tbtc.safeTransfer(address(stbtc), tbtc.balanceOf(address(this)));
    }

    /// @notice Adds a new maintainer address.
    /// @param maintainerToAdd Address of the new maintainer.
    function addMaintainer(address maintainerToAdd) external onlyOwner {
        if (maintainerToAdd == address(0)) {
            revert ZeroAddress();
        }
        if (isMaintainer[maintainerToAdd]) {
            revert MaintainerAlreadyRegistered();
        }
        maintainers.push(maintainerToAdd);
        isMaintainer[maintainerToAdd] = true;

        emit MaintainerAdded(maintainerToAdd);
    }

    /// @notice Removes the maintainer address.
    /// @param maintainerToRemove Address of the maintainer to remove.
    function removeMaintainer(address maintainerToRemove) external onlyOwner {
        if (!isMaintainer[maintainerToRemove]) {
            revert MaintainerNotRegistered();
        }
        delete (isMaintainer[maintainerToRemove]);

        for (uint256 i = 0; i < maintainers.length; i++) {
            if (maintainers[i] == maintainerToRemove) {
                maintainers[i] = maintainers[maintainers.length - 1];
                // slither-disable-next-line costly-loop
                maintainers.pop();
                break;
            }
        }

        emit MaintainerRemoved(maintainerToRemove);
    }

    /// @notice Returns the total amount of tBTC allocated to MezoPortal including
    ///         the amount that is currently hold by this contract.
    function totalAssets() external view returns (uint256) {
        return depositBalance + tbtc.balanceOf(address(this));
    }

    /// @notice Returns the list of maintainers.
    function getMaintainers() external view returns (address[] memory) {
        return maintainers;
    }
}
