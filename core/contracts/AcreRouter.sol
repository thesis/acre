// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title AcreRouter
/// @notice AcreRouter is a contract that routes funds from stBTC (Acre) to
///         a given vault and back. Vaults fund yield strategies that
///         generate yield for Bitcoin holders.
contract AcreRouter is OwnableUpgradeable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stBTC;
    IERC20 public immutable tBTC;

    /// @notice Approved vaults within the Yiern Modules that implement ERC4626
    ///         standard. These vaults deposit assets to yield strategies, e.g.
    ///         Uniswap V3 WBTC/TBTC pool. Vault can be a part of Acre ecosystem
    ///         or can be implemented externally. As long as it complies with
    ///         ERC4626 standard and is approved by the Acre Manager it can be
    ///         plugged into Acre.
    address[] public vaults;
    mapping(address => bool) public isVault;

    /// @notice Acre Manager address. Only Acre Manager can set or remove Vaults.
    address public acreManager;

    event VaultAdded(address indexed vault);
    event VaultRemoved(address indexed vault);

    event AcreManagerSet(address indexed manager);

    modifier onlyAcreManager() {
        require(msg.sender == acreManager, "Acre Manager only");
        _;
    }

    constructor(IERC20 _stBTC, IERC20 _tBTC) {
        stBTC = _stBTC;
        tBTC = _tBTC;
    }

    /// @notice Sets the Acre Manager address.
    /// @param manager Address of the Acre Manager.
    function setAcreManager(address manager) external onlyOwner {
        require(manager != address(0), "Cannot be zero address");
        acreManager = manager;
        emit AcreManagerSet(manager);
    }

    /// @notice Adds a vault to the list of approved vaults.
    /// @param vault Address of the vault to add.
    function addVault(address vault) external onlyAcreManager {
        require(!isVault[vault], "Vault already exists");
        vaults.push(vault);
        isVault[vault] = true;
        emit VaultAdded(vault);
    }

    /// @notice Removes a vault from the list of approved vaults.
    /// @param vault Address of the vault to remove.
    function removeVault(address vault) external onlyAcreManager {
        require(isVault[vault], "Not an vault");

        delete isVault[vault];

        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i] == vault) {
                vaults[i] = vaults[vaults.length - 1];
                vaults.pop();
                break;
            }
        }

        emit VaultRemoved(vault);
    }

    /// @notice Routes funds from stBTC (Acre) to a given vault
    /// @param vault Address of the vault to route the funds to.
    /// @param amount Amount of TBTC to deposit.
    function deposit(address vault, uint256 amount) public {
        require(msg.sender == address(stBTC), "stBTC only");
        if (!isVault[vault]) {
            revert("Vault is not approved");
        }

        tBTC.safeTransferFrom(msg.sender, address(this), amount);
        tBTC.safeIncreaseAllowance(vault, amount);
        // TODO: implement protection from the inflation attack / slippage
        IERC4626(vault).deposit(amount, address(this));
    }

    /// @notice Redeem TBTC from a vault and approves them to be collected
    ///         by stBTC (Acre)
    /// @param vault Address of the vault to collect the assets from.
    /// @param shares Amount of shares to collect. Shares are the internal representation
    ///               of the underlying asset in the vault. Concrete amount of the
    ///               underlying asset is calculated by calling `convertToAssets` on
    ///               the vault and the shares are burned.
    function redeem(address vault, uint256 shares) public {
        require(msg.sender == address(stBTC), "stBTC only");

        if (!isVault[vault]) {
            revert("Vault is not approved");
        }

        // TODO: implement protection from the inflation attack / slippage
        uint256 assets = IERC4626(vault).redeem(
            shares,
            address(this),
            address(this)
        );
        tBTC.safeIncreaseAllowance(address(stBTC), assets);
    }
}
