// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

// TODO: Update after the released version with a commit hash reference
// https://github.com/keep-network/tbtc-v2/pull/760

/// @title TBTC application vault
/// @notice TBTC is a fully Bitcoin-backed ERC-20 token pegged to the price of
///         Bitcoin. It facilitates Bitcoin holders to act on the Ethereum
///         blockchain and access the decentralized finance (DeFi) ecosystem.
///         TBTC Vault mints and unmints TBTC based on Bitcoin balances in the
///         Bank.
/// @dev TBTC Vault is the owner of TBTC token contract and is the only contract
///      minting the token.
interface ITBTCVault {
    // Represents optimistic minting request for the given deposit revealed
    // to the Bridge.
    struct OptimisticMintingRequest {
        // UNIX timestamp at which the optimistic minting was requested.
        uint64 requestedAt;
        // UNIX timestamp at which the optimistic minting was finalized.
        // 0 if not yet finalized.
        uint64 finalizedAt;
    }

    /// @notice Collection of all revealed deposits for which the optimistic
    ///         minting was requested. Indexed by a deposit key computed as
    ///         `keccak256(fundingTxHash | fundingOutputIndex)`.
    function optimisticMintingRequests(
        uint256 depositKey
    ) external returns (OptimisticMintingRequest memory);

    /// @notice Divisor used to compute the treasury fee taken from each
    ///         optimistically minted deposit and transferred to the treasury
    ///         upon finalization of the optimistic mint. This fee is computed
    ///         as follows: `fee = amount / optimisticMintingFeeDivisor`.
    ///         For example, if the fee needs to be 2%, the
    ///         `optimisticMintingFeeDivisor` should be set to `50` because
    ///         `1/50 = 0.02 = 2%`.
    ///         The optimistic minting fee does not replace the deposit treasury
    ///         fee cut by the Bridge. The optimistic fee is a percentage AFTER
    ///         the treasury fee is cut:
    ///         `optimisticMintingFee = (depositAmount - treasuryFee) / optimisticMintingFeeDivisor`
    function optimisticMintingFeeDivisor() external returns (uint32);
}
