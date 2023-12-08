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

    constructor(
        IERC20 tbtc,
        address initialOwner
    )
        ERC4626(tbtc)
        ERC20("Acre Staked Bitcoin", "stBTC")
        Ownable(initialOwner)
    {
        stakingParameters = StakingParameters({
            minimumDepositAmount: 10000000000000000, // 0.01 tBTC
            maximumTotalAssets: 25000000000000000000 // 25 tBTC
        });
    }

    /// @notice Updates parameters of staking.
    /// @dev Requirements:
    ///      - Minimum deposit amount must be greater than zero,
    ///      - Minimum deposit amount must be greater than or equal to the
    ///        minimum deposit amount in the tBTC system,
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
        require(
            minimumDepositAmount > 0,
            "Minimum deposit amount must be greater than zero"
        );

        // TODO: Do we need this requirement?
        require(
            minimumDepositAmount >= _getTBTCSystemMinDepositAmount(),
            "Minimum deposit amount must be greater than or to the equal minimum deposit amount in tBTC system"
        );

        require(
            maximumTotalAssets > 0,
            "Maximum total assets amount must be greater than zero"
        );

        stakingParameters.minimumDepositAmount = minimumDepositAmount;
        stakingParameters.maximumTotalAssets = maximumTotalAssets;

        emit StakingParametersUpdated(minimumDepositAmount, maximumTotalAssets);
    }

    function deposit(
        uint256 assets,
        address receiver
    ) public override returns (uint256) {
        require(
            assets >= stakingParameters.minimumDepositAmount,
            "Amount is less than minimum"
        );

        uint256 shares = super.deposit(assets, receiver);

        return shares;
    }

    function mint(
        uint256 shares,
        address receiver
    ) public override returns (uint256) {
        uint256 assets = super.mint(shares, receiver);

        require(
            assets >= stakingParameters.minimumDepositAmount,
            "Amount is less than minimum"
        );

        return assets;
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
        return stakingParameters.maximumTotalAssets - totalAssets();
    }

    /// @notice Returns the maximum amount of the vault shares that can be
    ///         minted for the receiver, through a mint call.
    /// @dev Since the Acre contract limits the maximum total tBTC tokens this
    ///      function converts the maximum deposit amount to shares.
    /// @return The maximum amount of the vault shares.
    function maxMint(address receiver) public view override returns (uint256) {
        return previewDeposit(maxDeposit(receiver));
    }

    function _getTBTCSystemMinDepositAmount() private pure returns (uint256) {
        // TODO: Implement if we want to make sure the minimum deposit amount is
        // greater than or equal the minimum dposit amount in the tBTC system.

        // (uint64 depositDustThreshold, , , ) = tbtcBridge.depositParameters();

        // // The `depositDustThreshold` is in satoshi so we need to cast to tBTC
        // // decimals.
        // return 10 ** (ERC20(asset()).decimals() - 8) * depositDustThreshold;

        return 10000000000000000; // 0.01 tBTC
    }
}
