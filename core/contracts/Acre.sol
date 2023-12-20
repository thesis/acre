// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Acre
/// @notice This contract implements the ERC-4626 tokenized vault standard. By
///         staking tBTC, users acquire a liquid staking token called stBTC,
///         commonly referred to as "shares". The staked tBTC is securely
///         deposited into Acre's vaults, where it generates yield over time.
///         Users have the flexibility to redeem stBTC, enabling them to
///         withdraw their staked tBTC along with the accrued yield.
/// @dev ERC-4626 is a standard to optimize and unify the technical parameters
///      of yield-bearing vaults. This contract facilitates the minting and
///      burning of shares (stBTC), which are represented as standard ERC20
///      tokens, providing a seamless exchange with tBTC tokens.
contract Acre is ERC4626, Ownable {
    struct StakingParameters {
        // Minimum amount for a single deposit operation.
        uint256 minimumDepositAmount;
        // Maximum total amount of tBTC token held by Acre.
        uint256 maximumTotalAssets;
    }

    StakingParameters public stakingParameters;

    event StakeReferral(bytes32 indexed referral, uint256 assets);
    event StakingParametersUpdated(
        uint256 minimumDepositAmount,
        uint256 maximumTotalAssets
    );

    error DepositAmountLessThanMin(uint256 amount, uint256 min);
    error InvalidStakingParameter();

    constructor(
        IERC20 tbtc
    ) ERC4626(tbtc) ERC20("Acre Staked Bitcoin", "stBTC") Ownable(msg.sender) {
        stakingParameters.minimumDepositAmount = 0.01 ether; // 0.01 tBTC
        stakingParameters.maximumTotalAssets = 25 ether; // 25 tBTC
    }

    /// @notice Updates parameters of staking.
    /// @dev Requirements:
    ///      - Maximum total assets must be greater than zero.
    /// @param minimumDepositAmount New value of the minimum deposit amount. It
    ///        is the minimum amount for a single deposit operation.
    /// @param maximumTotalAssets New value of the maximum total assets amount.
    ///        It is the maximum amount of the tBTC token that the Acre can
    ///        hold.
    function updateStakingParameters(
        uint256 minimumDepositAmount,
        uint256 maximumTotalAssets
    ) external onlyOwner {
        // TODO: Introduce a parameters update process.
        if (maximumTotalAssets == 0) {
            revert InvalidStakingParameter();
        }

        stakingParameters.minimumDepositAmount = minimumDepositAmount;
        stakingParameters.maximumTotalAssets = maximumTotalAssets;

        emit StakingParametersUpdated(minimumDepositAmount, maximumTotalAssets);
    }

    function deposit(
        uint256 assets,
        address receiver
    ) public override returns (uint256) {
        if (assets < stakingParameters.minimumDepositAmount) {
            revert DepositAmountLessThanMin(
                assets,
                stakingParameters.minimumDepositAmount
            );
        }

        return super.deposit(assets, receiver);
    }

    function mint(
        uint256 shares,
        address receiver
    ) public override returns (uint256 assets) {
        if (
            (assets = super.mint(shares, receiver)) <
            stakingParameters.minimumDepositAmount
        ) {
            revert DepositAmountLessThanMin(
                assets,
                stakingParameters.minimumDepositAmount
            );
        }
    }

    /// @notice Stakes a given amount of tBTC token and mints shares to a
    ///         receiver.
    /// @dev This function calls `deposit` function from `ERC4626` contract. The
    ///      amount of the assets has to be pre-approved in the tBTC contract.
    /// @param assets Approved amount for the transfer and stake.
    /// @param receiver The address to which the shares will be minted.
    /// @param referral Data used for referral program.
    /// @return shares Minted shares.
    function stake(
        uint256 assets,
        address receiver,
        bytes32 referral
    ) public returns (uint256) {
        // TODO: revisit the type of referral.
        uint256 shares = deposit(assets, receiver);

        if (referral != bytes32(0)) {
            emit StakeReferral(referral, assets);
        }

        return shares;
    }

    /// @notice Returns the maximum amount of the tBTC token that can be
    ///         deposited into the vault for the receiver, through a deposit
    ///         call. It takes into account the staking parameter, maximum total
    ///         assets, which determines the total amount of tBTC token held by
    ///         Acre.
    /// @return The maximum amount of the tBTC token.
    function maxDeposit(address) public view override returns (uint256) {
        uint256 _totalAssets = totalAssets();

        return
            _totalAssets >= stakingParameters.maximumTotalAssets
                ? 0
                : stakingParameters.maximumTotalAssets - _totalAssets;
    }

    /// @notice Returns the maximum amount of the vault shares that can be
    ///         minted for the receiver, through a mint call.
    /// @dev Since the Acre contract limits the maximum total tBTC tokens this
    ///      function converts the maximum deposit amount to shares.
    /// @return The maximum amount of the vault shares.
    function maxMint(address receiver) public view override returns (uint256) {
        return previewDeposit(maxDeposit(receiver));
    }
}
