// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Router.sol";
import "./Acre.sol";

// @notice Interface the Vaults connected to the Dispatcher contract should
//         implement.
interface IVault is IERC4626 {}

///         a given vault and back. Vaults supply yield strategies with TBTC that
///         generate yield for Bitcoin holders.
contract Dispatcher is Router, Ownable {
    using SafeERC20 for IERC20;

    error VaultAlreadyAuthorized();
    error VaultUnauthorized();
    error InvalidVaultsWeight(uint16 vaultsWeight, uint16 vaultsTotalWeight);
    error TotalAmountZero();

    struct VaultInfo {
        bool authorized;
        uint16 weight;
    }

    Acre public acre;
    IERC20 public tbtc;

    uint16 public vaultsTotalWeight = 1000;

    /// @notice Authorized Yield Vaults that implement ERC4626 standard. These
    ///         vaults deposit assets to yield strategies, e.g. Uniswap V3
    ///         WBTC/TBTC pool. Vault can be a part of Acre ecosystem or can be
    ///         implemented externally. As long as it complies with ERC4626
    ///         standard and is authorized by the owner it can be plugged into
    ///         Acre.
    IVault[] public vaults;
    mapping(IVault => VaultInfo) public vaultsInfo;

    event VaultAuthorized(address indexed vault);
    event VaultDeauthorized(address indexed vault);
    event VaultWeightUpdated(
        address indexed vault,
        uint16 newWeight,
        uint16 oldWeight
    );

    constructor(Acre _acre, IERC20 _tbtc) Ownable(msg.sender) {
        acre = _acre;
        tbtc = _tbtc;
    }

    /// @notice Adds a vault to the list of authorized vaults.
    /// @param vault Address of the vault to add.
    function authorizeVault(IVault vault) external onlyOwner {
        if (vaultsInfo[vault].authorized) {
            revert VaultAlreadyAuthorized();
        }

        vaults.push(vault);
        vaultsInfo[vault].authorized = true;

        emit VaultAuthorized(address(vault));
    }

    /// @notice Removes a vault from the list of authorized vaults.
    /// @param vault Address of the vault to remove.
    function deauthorizeVault(IVault vault) external onlyOwner {
        if (!isVaultAuthorized(vault)) {
            revert VaultUnauthorized();
        }

        delete vaultsInfo[vault];

        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i] == vault) {
                vaults[i] = vaults[vaults.length - 1];
                // slither-disable-next-line costly-loop
                vaults.pop();
                break;
            }
        }

        emit VaultDeauthorized(address(vault));
    }

    function setVaultWeights(
        IVault[] memory vaultsToSet,
        uint16[] memory newWeights
    ) external onlyOwner {
        for (uint256 i = 0; i < vaultsToSet.length; i++) {
            IVault vault = vaultsToSet[i];
            uint16 newWeight = newWeights[i];

            if (newWeight > 0 && !isVaultAuthorized(vault)) {
                revert VaultUnauthorized();
            }

            uint16 oldWeight = vaultsInfo[vault].weight;
            vaultsInfo[vault].weight = newWeight;

            emit VaultWeightUpdated(address(vault), newWeight, oldWeight);
        }
    }

    function isVaultAuthorized(IVault vault) public view returns (bool) {
        return vaultsInfo[vault].authorized;
    }

    function getVaults() external view returns (IVault[] memory) {
        return vaults;
    }

    // TODO: Add access restriction
    function depositToVault(
        IVault vault,
        uint256 amount,
        uint256 minSharesOut
    ) public returns (uint256 sharesOut) {
        if (!isVaultAuthorized(vault)) {
            revert VaultUnauthorized();
        }

        require(vault.asset() == address(tbtc), "vault asset is not tbtc");

        IERC20(tbtc).safeTransferFrom(address(acre), address(this), amount);
        IERC20(tbtc).approve(address(vault), amount);

        return Router.deposit(vault, address(this), amount, minSharesOut);
    }

    // TODO: Add access restriction
    function withdrawFromVault(
        IVault vault,
        uint256 amount,
        uint256 maxSharesOut
    ) public returns (uint256 sharesOut) {
        uint256 shares = vault.previewWithdraw(amount);

        IERC20(vault).approve(address(vault), shares);

        return Router.withdraw(vault, address(acre), amount, maxSharesOut);
    }

    // TODO: Add access restriction
    function redeemFromVault(
        IVault vault,
        uint256 shares,
        uint256 minAmountOut
    ) public returns (uint256 amountOut) {
        IERC20(vault).approve(address(vault), shares);

        Router.redeem(vault, address(acre), shares, minAmountOut);
    }

    // TODO: Add function to withdrawMax

    // TODO: Check possibilities of Dispatcher upgrades and shares migration.
    function migrateShares(IVault[] calldata _vaults) public onlyOwner {
        address newDispatcher = address(acre.dispatcher());

        for (uint i = 0; i < _vaults.length; i++) {
            _vaults[i].transfer(
                newDispatcher,
                _vaults[i].balanceOf(address(this))
            );
        }
    }

    function vaultsWeight() internal view returns (uint16 totalWeight) {
        for (uint256 i = 0; i < vaults.length; i++) {
            totalWeight += vaultsInfo[vaults[i]].weight;
        }
    }

    function totalAssets() public view returns (uint256 totalAmount) {
        // Balance deployed in Vaults.
        for (uint256 i = 0; i < vaults.length; i++) {
            IVault vault = IVault(vaults[i]);
            totalAmount += vault.convertToAssets(
                vault.balanceOf(address(this))
            );
        }

        // Unused balance in Dispatcher.
        // TODO: It is not expected the Dispatcher will hold any tBTC, we should
        // add a function that would sweep tBTC from Dispatcher to Acre contract.
        totalAmount += tbtc.balanceOf(address(this));
    }

    // TODO: This solution expects all tBTC to be withdrawn from all the Vaults before
    // allocation. We may need improved solution to calculate exactly how much
    // tBTC should be deposited or withdrawn from each vault.
    // TODO: Make callable only by the maintainer bot.
    // TODO: Add pre-calculated minSharesOut values for each deposit.
    // TODO: Consider having constant total weight, e.g. 1000, so the vaults can
    //       have
    function allocate() public {
        uint16 vaultsWeight = vaultsWeight();
        if (
            vaultsTotalWeight == 0 ||
            vaultsWeight == 0 ||
            vaultsWeight > vaultsTotalWeight
        ) revert InvalidVaultsWeight(vaultsWeight, vaultsTotalWeight);

        // tBTC held by Dispatcher and registered Vaults.
        uint256 totalAmount = totalAssets();

        // Unallocated tBTC in the Acre contract.
        totalAmount += tbtc.balanceOf(address(acre));
        if (totalAmount == 0) revert TotalAmountZero();

        for (uint256 i = 0; i < vaults.length; i++) {
            IVault vault = vaults[i];

            uint256 vaultAmount = (totalAmount * vaultsInfo[vault].weight) /
                vaultsTotalWeight;
            if (vaultAmount == 0) continue;

            // TODO: Pre-calculate the minSharesOut value off-chain as a slippage protection
            // before calling the allocate function.
            uint256 minSharesOut = vault.previewDeposit(vaultAmount);

            // Allocate tBTC to Vault.
            depositToVault(vault, vaultAmount, minSharesOut);
        }
    }
}
