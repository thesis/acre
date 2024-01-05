// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "./Router.sol";
import "./Acre.sol";

/// @title Dispatcher
/// @notice Dispatcher is a contract that routes tBTC from Acre (stBTC) to
///         yield vaults and back. Vaults supply yield strategies with tBTC that
///         generate yield for Bitcoin holders.
contract Dispatcher is Router, Ownable {
    using SafeERC20 for IERC20;

    /// Struct holds information about a vault.
    /// @param authorized True if the vault is authorized.
    /// @param weight Weight of the vault in %. Total weight of all vaults must
    ///               be less or equal to 'vaultsMaxWeight'.
    struct VaultInfo {
        bool authorized;
        uint16 weight;
    }

    /// The main Acre contract holding tBTC deposited by stakers.
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

    /// Vaults weights defined in VaultInfo structure should sum up to
    /// vaultsMaxWeight. If vaults weight defined in the VaultInfo
    /// is less than vaultsMaxWeight the rest of the assets will be kept
    /// as a buffer in the Acre contract. This number should reflect 100%
    /// of all the tBTC staked in or through Acre. An owner can set the vault's
    /// weight to 2 decimal points precision. If an owner wants to set a vault with
    /// e.g. 25.55%, then the weight should be set to 2555.
    uint16 public constant vaultsMaxWeight = 10000;

    /// Emitted when a vault is authorized.
    /// @param vault Address of the vault.
    event VaultAuthorized(address indexed vault, uint16 weight);

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

    /// Emitted when the weight of a vault is updated.
    /// @param vault Address of the vault.
    /// @param newWeight New weight of the vault.
    /// @param oldWeight Old weight of the vault.
    event VaultWeightUpdated(
        address indexed vault,
        uint16 newWeight,
        uint16 oldWeight
    );

    /// Reverts if the vault is already authorized.
    error VaultAlreadyAuthorized();

    /// Reverts if the vault is not authorized.
    error VaultUnauthorized();

    /// Reverts if the caller is not the maintainer.
    error NotMaintainer();

    /// Reverts if the address is zero.
    error ZeroAddress();

    /// Reverts if the arrays of vaults addresses and corresponding weights have
    /// different length.
    error VaultWeightsMismatch();

    /// Reverts if the weight of the vault is zero.
    error VaultWeightZero();

    /// Reverts if the sum of vaults weights exceeds the total weight.
    error VaultWeightsExceedTotalWeight();

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

    /// @notice Updates the maintainer address.
    /// @param newMaintainer Address of the new maintainer.
    function updateMaintainer(address newMaintainer) external onlyOwner {
        if (newMaintainer == address(0)) {
            revert ZeroAddress();
        }

        maintainer = newMaintainer;

        emit MaintainerUpdated(maintainer);
    }

    /// @notice Adds a vault to the list of authorized vaults.
    /// @param vault Address of the vault to add.
    /// @param weight Weight of the vault. If by adding a new vault the total
    ///               weight of all vaults exceeds 'vaultsMaxWeight' the
    ///               transaction will revert. In this case the owner should
    ///               update the weights of the existing vaults and make room
    ///               for the new one.
    function authorizeVault(address vault, uint16 weight) external onlyOwner {
        if (isVaultAuthorized(vault)) {
            revert VaultAlreadyAuthorized();
        }

        if (vault == address(0)) {
            revert ZeroAddress();
        }

        if (weight == 0) {
            revert VaultWeightZero();
        }

        if (getVaultsTotalWeight() + weight > vaultsMaxWeight) {
            revert VaultWeightsExceedTotalWeight();
        }

        vaults.push(vault);
        vaultsInfo[vault].authorized = true;
        vaultsInfo[vault].weight = weight;

        emit VaultAuthorized(vault, weight);
    }

    /// @notice Removes a vault from the list of authorized vaults.
    /// @param vault Address of the vault to remove.
    function deauthorizeVault(address vault) external onlyOwner {
        if (!isVaultAuthorized(vault)) {
            revert VaultUnauthorized();
        }

        vaultsInfo[vault].authorized = false;
        vaultsInfo[vault].weight = 0;

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

    /// @notice Updates the weights of the vaults.
    /// @param vaultsToSet Addresses of the vaults to update.
    /// @param newWeights New weights of the vaults.
    function updateVaultWeights(
        address[] memory vaultsToSet,
        uint16[] memory newWeights
    ) external onlyOwner {
        if (vaultsToSet.length != newWeights.length) {
            revert VaultWeightsMismatch();
        }

        for (uint256 i = 0; i < vaultsToSet.length; i++) {
            address vault = vaultsToSet[i];
            uint16 newWeight = newWeights[i];

            if (!isVaultAuthorized(vault)) {
                revert VaultUnauthorized();
            }

            if (newWeight == 0) {
                revert VaultWeightZero();
            }

            uint16 oldWeight = vaultsInfo[vault].weight;
            vaultsInfo[vault].weight = newWeight;

            emit VaultWeightUpdated(address(vault), newWeight, oldWeight);
        }

        if (getVaultsTotalWeight() > vaultsMaxWeight) {
            revert VaultWeightsExceedTotalWeight();
        }
    }

    /// @notice Returns the total weight of all authorized vaults.
    function getVaultsTotalWeight() public view returns (uint16) {
        uint16 totalWeight = 0;
        for (uint256 i = 0; i < vaults.length; i++) {
            totalWeight += vaultsInfo[vaults[i]].weight;
        }
        return totalWeight;
    }

    /// TODO: allocate deposits according to the vaults weights.
    /// TODO: make depositToVault function internal once the allocation distribution is
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
    function getVaults() public view returns (address[] memory) {
        return vaults;
    }

    /// @notice Returns true if the vault is authorized.
    /// @param vault Address of the vault to check.
    function isVaultAuthorized(address vault) public view returns (bool) {
        return vaultsInfo[vault].authorized;
    }

    /// TODO: implement redeem() / withdraw() functions
}
