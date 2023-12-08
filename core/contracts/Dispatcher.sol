// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "./Router.sol";

/// @title Dispatcher
/// @notice Dispatcher is a contract that routes TBTC from stBTC (Acre) to
///         a given vault and back. Vaults supply yield strategies with TBTC that
///         generate yield for Bitcoin holders.
contract Dispatcher is Ownable {
    error VaultAlreadyAuthorized();
    error VaultUnauthorized();

    struct VaultInfo {
        bool authorized;
    }

    /// @notice Authorized Yield Vaults that implement ERC4626 standard. These
    ///         vaults deposit assets to yield strategies, e.g. Uniswap V3
    ///         WBTC/TBTC pool. Vault can be a part of Acre ecosystem or can be
    ///         implemented externally. As long as it complies with ERC4626
    ///         standard and is authorized by the owner it can be plugged into
    ///         Acre.
    address[] public vaults;
    mapping(address => VaultInfo) public vaultsInfo;

    event VaultAuthorized(address indexed vault);
    event VaultDeauthorized(address indexed vault);

    constructor() Ownable(msg.sender) {}

    /// @notice Adds a vault to the list of authorized vaults.
    /// @param vault Address of the vault to add.
    function authorizeVault(address vault) external onlyOwner {
        if (vaultsInfo[vault].authorized) {
            revert VaultAlreadyAuthorized();
        }

        vaults.push(vault);
        vaultsInfo[vault].authorized = true;

        emit VaultAuthorized(vault);
    }

    /// @notice Removes a vault from the list of authorized vaults.
    /// @param vault Address of the vault to remove.
    function deauthorizeVault(address vault) external onlyOwner {
        if (!vaultsInfo[vault].authorized) {
            revert VaultUnauthorized();
        }

        vaultsInfo[vault].authorized = false;

        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i] == vault) {
                vaults[i] = vaults[vaults.length - 1];
                // slither-disable-next-line costly-loop
                vaults.pop();
                break;
            }
        }

        emit VaultDeauthorized(vault);
    }

    function getVaults() external view returns (address[] memory) {
        return vaults;
    }

    // TODO: add documentation
    function depositToVault(
        address vault,
        uint256 amount,
        uint256 minSharesOut
    ) public {
        require(msg.sender == address(stBTC), "stBTC only");
        require(vaultsInfo[vault].authorized, "Vault is not approved");

        deposit(IERC4626(vault), address(stBTC), amount, minSharesOut);
    }

    // TODO: add documentation
    function redeemFromVault(
        address vault,
        uint256 shares,
        uint256 minAssetsOut
    ) public {
        require(msg.sender == address(stBTC), "stBTC only");
        require(vaultsInfo[vault].authorized, "Vault is not approved");

        redeem(IERC4626(vault), address(stBTC), shares, minAssetsOut);
    }
}
