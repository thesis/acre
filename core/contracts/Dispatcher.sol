// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Router.sol";
import "./Acre.sol";

///         a given vault and back. Vaults supply yield strategies with TBTC that
///         generate yield for Bitcoin holders.
contract Dispatcher is Router, Ownable {
    using SafeERC20 for IERC20;


    error VaultAlreadyAuthorized();
    error VaultUnauthorized();

    struct VaultInfo {
        bool authorized;
    }

    Acre acre;
    IERC20 tbtc;

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

    constructor(Acre _acre, IERC20 _tbtc) Ownable(msg.sender) {
        acre = _acre;
        tbtc = _tbtc;
    }

    /// @notice Adds a vault to the list of authorized vaults.
    /// @param vault Address of the vault to add.
    function authorizeVault(address vault) external onlyOwner {
        if (vaultsInfo[vault].authorized) {
            revert VaultAlreadyAuthorized();
        }

        vaults.push(vault);
        vaultsInfo[vault].authorized = true;

        acre.approveVaultSharesForDispatcher(vault, type(uint256).max);

        emit VaultAuthorized(vault);
    }

    /// @notice Removes a vault from the list of authorized vaults.
    /// @param vault Address of the vault to remove.
    function deauthorizeVault(address vault) external onlyOwner {
        if (!isVaultAuthorized(vault)) {
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

        acre.approveVaultSharesForDispatcher(vault, 0);

        emit VaultDeauthorized(vault);
    }

    function isVaultAuthorized(address vault) public view returns (bool){
        return vaultsInfo[vault].authorized;
    }

    function getVaults() external view returns (address[] memory) {
        return vaults;
    }


// TODO: Add access restriction
    function depositToVault(
        IERC4626 vault,
        uint256 amount,
        uint256 minSharesOut
    ) public returns (uint256 sharesOut) {
        if (!isVaultAuthorized(address(vault))) {
            revert VaultUnauthorized();
        }

        require(vault.asset() == address(tbtc), "vault asset is not tbtc");

        IERC20(tbtc).safeTransferFrom(address(acre), address(this), amount);
        IERC20(tbtc).approve(address(vault), amount);

        Router.deposit(vault, address(acre), amount, minSharesOut);
    }

// TODO: Add access restriction
    function withdrawFromVault(
        IERC4626 vault,
        uint256 amount,
        uint256 maxSharesOut
    ) public returns (uint256 sharesOut) {
        uint256 shares = vault.previewWithdraw(amount);

        IERC20(vault).safeTransferFrom(address(acre), address(this), shares);
        IERC20(vault).approve(address(vault), shares);

        Router.withdraw(vault, address(acre), amount, maxSharesOut);
    }

// TODO: Add access restriction
    function redeemFromVault(
        IERC4626 vault,
        uint256 shares,
        uint256 minAmountOut
    ) public returns (uint256 amountOut) {
        IERC20(vault).safeTransferFrom(address(acre), address(this), shares);
        IERC20(vault).approve(address(vault), shares);

        Router.redeem(vault, address(acre), shares, minAmountOut);
    }

    // TODO: Add function to withdrawMax
}
