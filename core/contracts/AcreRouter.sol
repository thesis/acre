// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AcreRouter
/// @notice AcreRouter is a contract that routes TBTC from stBTC (Acre) to
///         a given vault and back. Vaults supply yield strategies with TBTC that
///         generate yield for Bitcoin holders.
contract AcreRouter is Ownable {
    struct Vault {
        bool approved;
    }

    /// @notice Approved vaults within the Yiern Modules that implement ERC4626
    ///         standard. These vaults deposit assets to yield strategies, e.g.
    ///         Uniswap V3 WBTC/TBTC pool. Vault can be a part of Acre ecosystem
    ///         or can be implemented externally. As long as it complies with
    ///         ERC4626 standard and is approved by the owner it can be
    ///         plugged into Acre.
    address[] public vaults;
    mapping(address => Vault) public vaultsInfo;

    event VaultAdded(address indexed vault);
    event VaultRemoved(address indexed vault);

    constructor() Ownable(msg.sender) {}

    /// @notice Adds a vault to the list of approved vaults.
    /// @param vault Address of the vault to add.
    function addVault(address vault) external onlyOwner {
        require(!vaultsInfo[vault].approved, "Vault already approved");

        vaults.push(vault);
        vaultsInfo[vault].approved = true;

        emit VaultAdded(vault);
    }

    /// @notice Removes a vault from the list of approved vaults.
    /// @param vault Address of the vault to remove.
    function removeVault(address vault) external onlyOwner {
        require(vaultsInfo[vault].approved, "Not a vault");

        vaultsInfo[vault].approved = false;

        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i] == vault) {
                vaults[i] = vaults[vaults.length - 1];
                // slither-disable-next-line costly-loop
                vaults.pop();
                break;
            }
        }

        emit VaultRemoved(vault);
    }

    function vaultsLength() external view returns (uint256) {
        return vaults.length;
    }
}
