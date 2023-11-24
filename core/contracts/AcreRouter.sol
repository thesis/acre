pragma solidity 0.8.20;

import {SafeTransferLib} from "solmate/src/utils/SafeTransferLib.sol";
import {ERC20} from "solmate/src/tokens/ERC20.sol";
import {ERC4626} from "solmate/src/mixins/ERC4626.sol";
import {Owned} from "solmate/src/auth/Owned.sol";

// TODO: add description
contract AcreRouter is Owned {
    using SafeTransferLib for ERC20;

    ERC20 public immutable stBTC;
    ERC20 public immutable tBTC;

    /// @notice Approved allocators which essentially are the ERC4626 vaults that
    ///         deposit funds to yield strategies, e.g. Uniswap V3 WBTC/TBTC pool.
    ///         Each Allocator contract is managed by a Yield Manager. From Acre"s
    ///         perspective, the Allocator contract can be a part of an external
    ///         Yield Module and does not care how the yield is generated.
    address[] public allocators;
    mapping(address => bool) public isAllocator;

    /// @notice Acre Manager address. Only Acre Manager can set or remove
    ///         Strategy Allocators.
    address public acreManager;

    event AllocatorAdded(address indexed allocator);
    event AllocatorRemoved(address indexed allocator);

    event AcreManagerSet(address indexed manager);

    modifier onlyAcreManager() {
        require(msg.sender == acreManager, "Caller is not an Acre Manager");
        _;
    }

    constructor(ERC20 _stBTC, ERC20 _tBTC) Owned(msg.sender) {
        stBTC = _stBTC;
        tBTC = _tBTC;
    }

    function setAcreManager(address manager) external onlyOwner {
        require(manager != address(0), "Zero address");
        acreManager = manager;
        emit AcreManagerSet(manager);
    }

    function addAllocator(address allocator) external onlyAcreManager {
        require(!isAllocator[allocator], "Allocator already exists");
        allocators.push(allocator);
        isAllocator[allocator] = true;
        emit AllocatorAdded(allocator);
    }

    function removeAllocator(address allocator) external onlyAcreManager {
        require(isAllocator[allocator], "Not an allocator");

        delete isAllocator[allocator];

        for (uint256 i = 0; i < allocators.length; i++) {
            if (allocators[i] == allocator) {
                allocators[i] = allocators[allocators.length - 1];
                allocators.pop();
                break;
            }
        }

        emit AllocatorRemoved(allocator);
    }

    /// @notice Routes funds from stBTC (Acre) to a given allocator
    /// @param allocator Address of the allocator to route the funds to.
    /// @param amount Amount of TBTC to allocate.
    function allocate(address allocator, uint256 amount) public {
        require(msg.sender == address(stBTC), "stBTC only");
        if (!isAllocator[allocator]) {
            revert("Allocator is not approved");
        }

        tBTC.safeTransferFrom(msg.sender, address(this), amount);
        tBTC.safeApprove(allocator, amount);
        // TODO: implement protection from the inflation attack / slippage
        ERC4626(allocator).deposit(amount, address(this));
    }

    /// @notice Collects TBTC from an allocator and approves them to be collected
    ///         by stBTC (Acre)
    /// @param allocator Address of the allocator to collect the assets from.
    /// @param shares Amount of shares to collect. Shares are the internal representation
    ///               of the underlying asset in the allocator. Concrete amount of the
    ///               underlying asset is calculated by calling `convertToAssets` on
    ///               the allocator and the shares are burned.
    function collect(address allocator, uint256 shares) public {
        require(msg.sender == address(stBTC), "stBTC only");

        if (!isAllocator[allocator]) {
            revert("Allocator is not approved");
        }

        // TODO: implement protection from the inflation attack / slippage
        // TODO: use IERC4626 interface
        uint256 assets = ERC4626(allocator).redeem(shares, address(this), address(this));
        tBTC.safeApprove(address(stBTC), assets);
    }
}
