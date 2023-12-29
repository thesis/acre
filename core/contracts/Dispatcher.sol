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

    struct VaultInfo {
        bool authorized;
    }

    Acre public immutable acre; // Depositing tBTC into Acre returns stBTC.
    IERC20 public immutable tBTC;

    address public maintainer;

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
    event DepositAllocated(
        address indexed vault,
        uint256 amount,
        uint256 minSharesOut
    );
    event MaintainerUpdated(address indexed maintainer);

    error VaultAlreadyAuthorized();
    error VaultUnauthorized();
    error CallerUnauthorized(string reason);
    error ZeroAddress();

    modifier onlyMaintainer() {
        if (msg.sender != maintainer) {
            revert CallerUnauthorized("Maintainer only");
        }
        _;
    }

    constructor(Acre _acre, IERC20 _tBTC) Ownable(msg.sender) {
        acre = _acre;
        tBTC = _tBTC;
    }

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
        if (!vaultsInfo[vault].authorized) {
            revert VaultUnauthorized();
        }
        emit DepositAllocated(vault, amount, minSharesOut);

        // slither-disable-next-line arbitrary-send-erc20
        tBTC.safeTransferFrom(address(acre), address(this), amount);
        tBTC.forceApprove(address(vault), amount);

        deposit(IERC4626(vault), address(acre), amount, minSharesOut);
    }

    /// @notice Updates the maintainer address.
    /// @param _maintainer Address of the new maintainer.
    function updateMaintainer(address _maintainer) external onlyOwner {
        if (_maintainer == address(0)) {
            revert ZeroAddress();
        }

        maintainer = _maintainer;

        emit MaintainerUpdated(maintainer);
    }

    /// @notice Returns the list of authorized vaults.
    function getVaults() external view returns (address[] memory) {
        return vaults;
    }

    /// TODO: implement redeem() / withdraw() functions
}
