// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "./Router.sol";
import "./Acre.sol";

/// @title Dispatcher
/// @notice Dispatcher is a contract that routes tBTC from Acre (stBTC) to
///         a given vault and back. Vaults supply yield strategies with TBTC that
///         generate yield for Bitcoin holders.
contract Dispatcher is Router, Ownable {
    using SafeERC20 for IERC20;

    /// Struct holds information about a vault.
    struct VaultInfo {
        bool authorized;
    }

    /// Depositing tBTC into Acre returns stBTC.
    Acre public immutable acre;
    /// tBTC token contract.
    IERC20 public immutable tbtc;
    /// Address of the maintainer bot.
    address public maintainer;

    /// Authorized Yield Vaults that implement ERC4626 standard. These
    /// vaults deposit assets to yield strategies, e.g. Uniswap V3
    /// WBTC/TBTC pool. Vault can be a part of Acre ecosystem or can be
    /// implemented externally. As long as it complies with ERC4626
    /// standard and is authorized by the owner it can be plugged into
    /// Acre.
    address[] public vaults;
    /// Mapping of vaults to their information.
    mapping(address => VaultInfo) public vaultsInfo;

    /// Emitted when a vault is authorized.
    /// @param vault Address of the vault.
    event VaultAuthorized(address indexed vault);
    /// Emitted when a vault is deauthorized.
    /// @param vault Address of the vault.
    event VaultDeauthorized(address indexed vault);
    /// Emitted when tBTC is routed to a vault.
    /// @param vault Address of the vault.
    /// @param amount Amount of tBTC.
    /// @param sharesOut Amount of shares received by Acre.
    event DepositAllocated(
        address indexed vault,
        uint256 amount,
        uint256 sharesOut
    );
    /// Emitted when the maintainer address is updated.
    /// @param maintainer Address of the new maintainer.
    event MaintainerUpdated(address indexed maintainer);

    /// Reverts if the vault is already authorized.
    error VaultAlreadyAuthorized();
    /// Reverts if the vault is not authorized.
    error VaultUnauthorized();
    /// Reverts if the caller is not the maintainer.
    error NotMaintainer();
    /// Reverts if the address is zero.
    error ZeroAddress();

    /// Modifier that reverts if the caller is not the maintainer.
    modifier onlyMaintainer() {
        if (msg.sender != maintainer) {
            revert NotMaintainer();
        }
        _;
    }

    constructor(Acre _acre, IERC20 _tbtc) Ownable(msg.sender) {
        acre = _acre;
        tbtc = _tbtc;
    }

    /// @notice Adds a vault to the list of authorized vaults.
    /// @param vault Address of the vault to add.
    function authorizeVault(address vault) external onlyOwner {
        if (isVaultAuthorized(vault)) {
            revert VaultAlreadyAuthorized();
        }

        vaults.push(vault);
        vaultsInfo[vault].authorized = true;

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

        emit VaultDeauthorized(vault);
    }

    /// @notice Updates the maintainer address.
    /// @param newMaintainer Address of the new maintainer.
    function updateMaintainer(address newMaintainer) external onlyOwner {
        if (newMaintainer == address(0)) {
            revert ZeroAddress();
        }

        maintainer = newMaintainer;

        emit MaintainerUpdated(maintainer);
    }

    /// TODO: make this function internal once the allocation distribution is
    /// implemented
    /// @notice Routes tBTC from Acre to a vault. Can be called by the maintainer
    ///         only.
    /// @param vault Address of the vault to route the assets to.
    /// @param amount Amount of tBTC to deposit.
    /// @param minSharesOut Minimum amount of shares to receive by Acre.
    function depositToVault(
        address vault,
        uint256 amount,
        uint256 minSharesOut
    ) public onlyMaintainer {
        if (!isVaultAuthorized(vault)) {
            revert VaultUnauthorized();
        }

        // slither-disable-next-line arbitrary-send-erc20
        tbtc.safeTransferFrom(address(acre), address(this), amount);
        tbtc.forceApprove(address(vault), amount);

        uint256 sharesOut = deposit(
            IERC4626(vault),
            address(acre),
            amount,
            minSharesOut
        );
        // slither-disable-next-line reentrancy-events
        emit DepositAllocated(vault, amount, sharesOut);
    }

    /// @notice Returns the list of authorized vaults.
    function getVaults() external view returns (address[] memory) {
        return vaults;
    }

    /// @notice Returns true if the vault is authorized.
    /// @param vault Address of the vault to check.
    function isVaultAuthorized(address vault) internal view returns (bool) {
        return vaultsInfo[vault].authorized;
    }

    /// TODO: implement redeem() / withdraw() functions
}
