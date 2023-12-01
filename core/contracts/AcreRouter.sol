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

    struct Vault {
        uint256 distribution; // percentage of TBTC in Acre to be distributed to the vault
        bool approved;
    }

    IERC20 public immutable stBTC;
    IERC20 public immutable tBTC;

    /// @notice Approved vaults within the Yiern Modules that implement ERC4626
    ///         standard. These vaults deposit assets to yield strategies, e.g.
    ///         Uniswap V3 WBTC/TBTC pool. Vault can be a part of Acre ecosystem
    ///         or can be implemented externally. As long as it complies with
    ///         ERC4626 standard and is approved by the Acre Manager it can be
    ///         plugged into Acre.
    address[] public vaults;
    mapping(address => Vault) public vaultsInfo;

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
    /// @param percent Percentage of TBTC in Acre to be distributed to the vault.
    function addVault(address vault, uint256 percent) external onlyAcreManager {
        require(!vaultsInfo[vault].approved, "Vault already approved");

        vaults.push(vault);
        vaultsInfo[vault].distribution = percent;
        vaultsInfo[vault].approved = true;

        require(
            sumOfVaultsDistribution() <= 100,
            "Total vaults distribution is greater than 100%"
        );

        emit VaultAdded(vault);
    }

    /// @notice Updates the distribution of a given vault. If the percentage of
    ///         all vaults distributions exceed 100% the transaction will revert.
    ///         In this case it is required to adjust the distribution of other
    ///         vault(s) first.
    /// @param vault Address of the vault to update.
    /// @param percent Percentage of TBTC in Acre to be distributed to the vault.
    function updateVaultDistribution(
        address vault,
        uint256 percent
    ) external onlyAcreManager {
        require(vaultsInfo[vault].approved, "Vault is not approved");

        vaultsInfo[vault].distribution = percent;

        require(
            sumOfVaultsDistribution() <= 100,
            "Total vaults distribution is greater than 100%"
        );
    }

    /// @notice Removes a vault from the list of approved vaults.
    /// @param vault Address of the vault to remove.
    function removeVault(address vault) external onlyAcreManager {
        require(vaultsInfo[vault].approved, "Not a vault");

        delete vaultsInfo[vault];

        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i] == vault) {
                vaults[i] = vaults[vaults.length - 1];
                vaults.pop();
                break;
            }
        }

        emit VaultRemoved(vault);
    }

    /// @notice Routes funds from stBTC (Acre) to a given vault according to
    ///         the vault distribution. The amount of TBTC to deposit is
    ///         calculated as a percentage of the total amount of TBTC in Acre.
    /// @param vault Address of the vault to route the funds to.
    /// @param minSharesOut Minimum amount of shares to receive.
    function deposit(
        address vault,
        uint256 minSharesOut
    ) public returns (uint256 sharesOut) {
        require(msg.sender == address(stBTC), "stBTC only");
        require(vaultsInfo[vault].approved, "Vault is not approved");

        uint256 totalBalance = tBTC.balanceOf(address(stBTC));
        uint256 vaultDistribution = vaultsInfo[vault].distribution; // percent
        uint256 amountToDeposit = (totalBalance * vaultDistribution) / 100;

        tBTC.safeTransferFrom(msg.sender, address(this), amountToDeposit);
        tBTC.safeIncreaseAllowance(vault, amountToDeposit);
        // stBTC is the Acre contract where the shares will be minted to
        if (
            (sharesOut = IERC4626(vault).deposit(
                amountToDeposit,
                address(stBTC)
            )) < minSharesOut
        ) {
            revert("Not enough shares received");
        }
    }

    // TODO: decide if we actually need this functionality. Is it be needed
    //       for automation of the deposit process by bots?
    function depositBatch() public {
        // require(msg.sender == address(stBTC), "stBTC only");
        // TODO: go through all the approved vaults and calulate the amount to
        //       deposit for each Vault based on their percent distribution.
        // TODO: minSharesOut can be calculated for each Vault using
        //       Acre.previewDeposit(amount) function.
    }

    /// @notice Redeem TBTC from a vault and approves them to be collected
    ///         by stBTC (Acre)
    /// @param vault Address of the vault to collect the assets from.
    /// @param shares Amount of shares to collect. Shares are the internal representation
    ///               of the underlying asset in the vault. Concrete amount of the
    ///               underlying asset is calculated by calling `convertToAssets` on
    ///               the vault and the shares are burned.
    /// @param minAssetsOut Minimum amount of TBTC to receive.
    function redeem(
        address vault,
        uint256 shares,
        uint256 minAssetsOut
    ) public returns (uint256 assetsOut) {
        require(msg.sender == address(stBTC), "stBTC only");
        require(vaultsInfo[vault].approved, "Vault is not approved");

        if (
            (assetsOut = IERC4626(vault).redeem(
                shares,
                address(this),
                address(stBTC)
            )) < minAssetsOut
        ) {
            revert("Not enough assets received");
        }
        tBTC.safeIncreaseAllowance(address(stBTC), assetsOut);
    }

    function sumOfVaultsDistribution() internal view returns (uint256 sum) {
        for (uint256 i = 0; i < vaults.length; i++) {
            sum += vaultsInfo[vaults[i]].distribution;
        }
    }
}
