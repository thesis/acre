// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

// This file defines an interface based on the Bridge contract. It defines functions
// from the external source contract that are used in this repository.
// Source:
// https://github.com/keep-network/tbtc-v2/blob/a78cc16e3521a6339f1c27891bb1ad60b9202406/solidity/contracts/bridge/Bridge.sol
//
// TODO: Update after the released version with a commit hash after PR is merged
// https://github.com/keep-network/tbtc-v2/pull/760 and released.

/// @title Bitcoin Bridge
/// @notice Bridge manages BTC deposit and redemption flow and is increasing and
///         decreasing balances in the Bank as a result of BTC deposit and
///         redemption operations performed by depositors and redeemers.
///
///         Depositors send BTC funds to the most recently created off-chain
///         ECDSA wallet of the bridge using pay-to-script-hash (P2SH) or
///         pay-to-witness-script-hash (P2WSH) containing hashed information
///         about the depositor’s Ethereum address. Then, the depositor reveals
///         their Ethereum address along with their deposit blinding factor,
///         refund public key hash and refund locktime to the Bridge on Ethereum
///         chain. The off-chain ECDSA wallet listens for these sorts of
///         messages and when it gets one, it checks the Bitcoin network to make
///         sure the deposit lines up. If it does, the off-chain ECDSA wallet
///         may decide to pick the deposit transaction for sweeping, and when
///         the sweep operation is confirmed on the Bitcoin network, the ECDSA
///         wallet informs the Bridge about the sweep increasing appropriate
///         balances in the Bank.
/// @dev Bridge is an upgradeable component of the Bank. The order of
///      functionalities in this contract is: deposit, sweep, redemption,
///      moving funds, wallet lifecycle, frauds, parameters.
interface IBridge {
    /// @notice Represents Bitcoin transaction data.
    struct BitcoinTxInfo {
        /// @notice Bitcoin transaction version.
        /// @dev `version` from raw Bitcoin transaction data.
        ///      Encoded as 4-bytes signed integer, little endian.
        bytes4 version;
        /// @notice All Bitcoin transaction inputs, prepended by the number of
        ///         transaction inputs.
        /// @dev `tx_in_count | tx_in` from raw Bitcoin transaction data.
        ///
        ///      The number of transaction inputs encoded as compactSize
        ///      unsigned integer, little-endian.
        ///
        ///      Note that some popular block explorers reverse the order of
        ///      bytes from `outpoint`'s `hash` and display it as big-endian.
        ///      Solidity code of Bridge expects hashes in little-endian, just
        ///      like they are represented in a raw Bitcoin transaction.
        bytes inputVector;
        /// @notice All Bitcoin transaction outputs prepended by the number of
        ///         transaction outputs.
        /// @dev `tx_out_count | tx_out` from raw Bitcoin transaction data.
        ///
        ///       The number of transaction outputs encoded as a compactSize
        ///       unsigned integer, little-endian.
        bytes outputVector;
        /// @notice Bitcoin transaction locktime.
        ///
        /// @dev `lock_time` from raw Bitcoin transaction data.
        ///      Encoded as 4-bytes unsigned integer, little endian.
        bytes4 locktime;
        // This struct doesn't contain `__gap` property as the structure is not
        // stored, it is used as a function's calldata argument.
    }

    /// @notice Represents data which must be revealed by the depositor during
    ///         deposit reveal.
    struct DepositRevealInfo {
        // Index of the funding output belonging to the funding transaction.
        uint32 fundingOutputIndex;
        // The blinding factor as 8 bytes. Byte endianness doesn't matter
        // as this factor is not interpreted as uint. The blinding factor allows
        // to distinguish deposits from the same depositor.
        bytes8 blindingFactor;
        // The compressed Bitcoin public key (33 bytes and 02 or 03 prefix)
        // of the deposit's wallet hashed in the HASH160 Bitcoin opcode style.
        bytes20 walletPubKeyHash;
        // The compressed Bitcoin public key (33 bytes and 02 or 03 prefix)
        // that can be used to make the deposit refund after the refund
        // locktime passes. Hashed in the HASH160 Bitcoin opcode style.
        bytes20 refundPubKeyHash;
        // The refund locktime (4-byte LE). Interpreted according to locktime
        // parsing rules described in:
        // https://developer.bitcoin.org/devguide/transactions.html#locktime-and-sequence-number
        // and used with OP_CHECKLOCKTIMEVERIFY opcode as described in:
        // https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki
        bytes4 refundLocktime;
        // Address of the Bank vault to which the deposit is routed to.
        // Optional, can be 0x0. The vault must be trusted by the Bridge.
        address vault;
    }

    /// @notice Represents tBTC deposit request data.
    struct DepositRequest {
        // Ethereum depositor address.
        address depositor;
        // Deposit amount in satoshi.
        uint64 amount;
        // UNIX timestamp the deposit was revealed at.
        // XXX: Unsigned 32-bit int unix seconds, will break February 7th 2106.
        uint32 revealedAt;
        // Address of the Bank vault the deposit is routed to.
        // Optional, can be 0x0.
        address vault;
        // Treasury TBTC fee in satoshi at the moment of deposit reveal.
        uint64 treasuryFee;
        // UNIX timestamp the deposit was swept at. Note this is not the
        // time when the deposit was swept on the Bitcoin chain but actually
        // the time when the sweep proof was delivered to the Ethereum chain.
        // XXX: Unsigned 32-bit int unix seconds, will break February 7th 2106.
        uint32 sweptAt;
        // The 32-byte deposit extra data. Optional, can be bytes32(0).
        bytes32 extraData;
        // This struct doesn't contain `__gap` property as the structure is stored
        // in a mapping, mappings store values in different slots and they are
        // not contiguous with other values.
    }

    /// @notice Sibling of the `revealDeposit` function. This function allows
    ///         to reveal a P2(W)SH Bitcoin deposit with 32-byte extra data
    ///         embedded in the deposit script. The extra data allows to
    ///         attach additional context to the deposit. For example,
    ///         it allows a third-party smart contract to reveal the
    ///         deposit on behalf of the original depositor and provide
    ///         additional services once the deposit is handled. In this
    ///         case, the address of the original depositor can be encoded
    ///         as extra data.
    /// @param fundingTx Bitcoin funding transaction data, see `BitcoinTx.Info`.
    /// @param reveal Deposit reveal data, see `RevealInfo struct.
    /// @param extraData 32-byte deposit extra data.
    /// @dev Requirements:
    ///      - All requirements from `revealDeposit` function must be met,
    ///      - `extraData` must not be bytes32(0),
    ///      - `extraData` must be the actual extra data used in the P2(W)SH
    ///        BTC deposit transaction.
    ///
    ///      If any of these requirements is not met, the wallet _must_ refuse
    ///      to sweep the deposit and the depositor has to wait until the
    ///      deposit script unlocks to receive their BTC back.
    function revealDepositWithExtraData(
        BitcoinTxInfo calldata fundingTx,
        DepositRevealInfo calldata reveal,
        bytes32 extraData
    ) external;

    /// @notice Collection of all revealed deposits indexed by
    ///         keccak256(fundingTxHash | fundingOutputIndex).
    ///         The fundingTxHash is bytes32 (ordered as in Bitcoin internally)
    ///         and fundingOutputIndex an uint32. This mapping may contain valid
    ///         and invalid deposits and the wallet is responsible for
    ///         validating them before attempting to execute a sweep.
    function deposits(
        uint256 depositKey
    ) external view returns (DepositRequest memory);

    /// @notice Returns the current values of Bridge deposit parameters.
    /// @return depositDustThreshold The minimal amount that can be requested
    ///         to deposit. Value of this parameter must take into account the
    ///         value of `depositTreasuryFeeDivisor` and `depositTxMaxFee`
    ///         parameters in order to make requests that can incur the
    ///         treasury and transaction fee and still satisfy the depositor.
    /// @return depositTreasuryFeeDivisor Divisor used to compute the treasury
    ///         fee taken from each deposit and transferred to the treasury upon
    ///         sweep proof submission. That fee is computed as follows:
    ///         `treasuryFee = depositedAmount / depositTreasuryFeeDivisor`
    ///         For example, if the treasury fee needs to be 2% of each deposit,
    ///         the `depositTreasuryFeeDivisor` should be set to `50`
    ///         because `1/50 = 0.02 = 2%`.
    /// @return depositTxMaxFee Maximum amount of BTC transaction fee that can
    ///         be incurred by each swept deposit being part of the given sweep
    ///         transaction. If the maximum BTC transaction fee is exceeded,
    ///         such transaction is considered a fraud.
    /// @return depositRevealAheadPeriod Defines the length of the period that
    ///         must be preserved between the deposit reveal time and the
    ///         deposit refund locktime. For example, if the deposit become
    ///         refundable on August 1st, and the ahead period is 7 days, the
    ///         latest moment for deposit reveal is July 25th. Value in seconds.
    function depositParameters()
        external
        view
        returns (
            uint64 depositDustThreshold,
            uint64 depositTreasuryFeeDivisor,
            uint64 depositTxMaxFee,
            uint32 depositRevealAheadPeriod
        );
}
