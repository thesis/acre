pragma solidity ^0.8.10;

import {ERC4626RouterBase} from "./lib/erc4626/ERC4626RouterBase.sol";
import {PeripheryPayments, IWETH9} from "./lib/erc4626/external/PeripheryPayments.sol";
import {SafeTransferLib} from "solmate/src/utils/SafeTransferLib.sol";
import {ERC20} from "solmate/src/tokens/ERC20.sol";
import {Owned} from "solmate/src/auth/Owned.sol";
import {IERC4626} from "./lib/erc4626/interfaces/IERC4626.sol";

// TODO: add description
contract AcreRouter is ERC4626RouterBase, Owned {
    using SafeTransferLib for ERC20;

    ERC20 public immutable stBTC;

    /// @notice Approved allocators which essentially are the ERC4626 vaults that
    ///         deposit funds to yield strategies, e.g. Uniswap V3 WBTC/TBTC pool.
    ///         Each Allocator contract is managed by a Yield Manager. From Acre"s
    ///         perspective, the Allocator contract can be a part of an external
    ///         Yield Module and does not care how the yield is generated.
    address[] public allocators;

    mapping(address => bool) public isAllocator;

    /// @notice Indicates if the given address is an Acre Manager. Only Acre Manager
    ///         can set or remove allocators.
    address public acreManager;

    event AllocatorAdded(address indexed allocator);
    event AllocatorRemoved(address indexed allocator);

    modifier onlyAcreManager() {
        require(msg.sender == acreManager, "Caller is not an Acre Manager");
        _;
    }

    constructor(
        IWETH9 weth,
        ERC20 _stBTC
    ) Owned(msg.sender) PeripheryPayments(weth) {
        stBTC = _stBTC;
    }

    function setAcreManager(address _acreManager) external onlyOwner {
        acreManager = _acreManager;
    }

    function addAllocator(address allocator) external onlyAcreManager {
        require(!isAllocator[allocator], "Allocator already exists");
        allocators.push(allocator);
        isAllocator[allocator] = true;
        emit AllocatorAdded(allocator);
    }

    function removeAllocator(address allocator) external onlyAcreManager {
        require(isAllocator[allocator], "This address is not a minter");

        delete isAllocator[allocator];

        for (uint256 i = 0; i < allocators.length; i++) {
            if (allocators[i] == allocator) {
                allocators[i] = allocators[allocators.length - 1];
                // slither-disable-next-line costly-loop
                allocators.pop();
                break;
            }
        }

        emit AllocatorRemoved(allocator);
    }

    /// @notice Allocates funds from stBTC (Acre) to an allocator
    function allocate(address allocator, uint256 amount) public {
        require(msg.sender == address(stBTC), "stBTC must be a caller");

        if (!isAllocator[allocator]) {
            revert("Allocator is not approved");
        }

        // TODO: implement allocation logic to an allocator
    }

    /// @notice Collects funds from an allocator and sends them to stBTC (Acre)
    function collect(address allocator, uint256 amount) public {
        require(msg.sender == address(stBTC), "stBTC must be a caller");

        if (!isAllocator[allocator]) {
            revert("Allocator is not approved");
        }

        // TODO: implement collection logic from an allocator
    }
}
