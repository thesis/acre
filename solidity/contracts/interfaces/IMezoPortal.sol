// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.24;

/// @title IMezoPortal
/// @dev Interface for the Mezo's Portal contract.
interface IMezoPortal {
    /// @notice DepositInfo keeps track of the deposit balance and unlock time.
    ///         Each deposit is tracked separately and associated with a specific
    ///         token. Some tokens can be deposited but can not be locked - in
    ///         that case the unlockAt is the block timestamp of when the deposit
    ///         was created. The same is true for tokens that can be locked but
    ///         the depositor decided not to lock them. Some deposits can mint
    ///         a receipt tokens against them: receiptMinted is the amount of
    ///         receipt tokens minted against a deposit, while feeOwed is the
    ///         fee owed by the deposit to Portal, and the lastFeeIntegral is
    ///         the last updated value of the fee integral.
    struct DepositInfo {
        uint96 balance;
        uint32 unlockAt;
        uint96 receiptMinted;
        uint96 feeOwed;
        uint88 lastFeeIntegral;
    }

    /// @notice Deposit and optionally lock tokens for the given period.
    /// @dev Lock period will be normalized to weeks. If non-zero, it must not
    ///      be shorter than the minimum lock period and must not be longer than
    ///      the maximum lock period.
    /// @param token token address to deposit
    /// @param amount amount of tokens to deposit
    /// @param lockPeriod lock period in seconds, 0 to not lock the deposit
    function deposit(address token, uint96 amount, uint32 lockPeriod) external;

    /// @notice Withdraws all deposited tokens.
    ///
    ///         Deposited lockable tokens can be withdrawn at any time if
    ///         there is no lock set on the deposit or the lock period has passed.
    ///         There is no way to withdraw locked deposit. Tokens that are not
    ///         lockable can be withdrawn at any time.
    ///
    ///         Deposits for which receipt tokens were minted and not fully
    ///         repaid can not be withdrawn even if the lock expired. Repaying
    ///         all receipt tokens is a must to withdraw the deposit. Upon
    ///         withdrawing a deposit for which the receipt tokens were minted,
    ///         the fee is collected based on the annual fee and the amount
    ///         of minted receipt tokens.
    ///
    ///         This function withdraws all deposited tokens. For partial
    ///         withdrawals, use `withdrawPartially`.
    /// @param token deposited token address
    /// @param depositId id of the deposit
    function withdraw(address token, uint256 depositId) external;

    /// @notice Withdraws part of the deposited tokens.
    ///
    ///         Deposited lockable tokens can be withdrawn at any time if
    ///         there is no lock set on the deposit or the lock period has passed.
    ///         There is no way to withdraw locked deposit. Tokens that are not
    ///         lockable can be withdrawn at any time.
    ///
    ///         Deposits for which receipt tokens were minted and fully repaid
    ///         can not be partially withdrawn even if the lock expired.
    ///         Repaying all receipt tokens is a must to partially withdraw the
    ///         deposit. If the fee for receipt tokens minted is non-zero, the
    ///         deposit can not be partially withdrawn and only a full
    ///         withdrawal is possible.
    ///
    ///         This function allows only for partial withdrawals. For full
    ///         withdrawals, use `withdraw`.
    /// @param token deposited token address
    /// @param depositId id of the deposit
    /// @param amount the amount to be withdrawn
    function withdrawPartially(
        address token,
        uint256 depositId,
        uint96 amount
    ) external;

    /// @notice The number of deposits created. Includes the deposits that
    ///         were fully withdrawn. This is also the identifier of the most
    ///         recently created deposit.
    function depositCount() external view returns (uint256);

    /// @notice Get the balance and unlock time of a given deposit.
    /// @param depositor depositor address
    /// @param token token address to get the balance
    /// @param depositId id of the deposit
    function getDeposit(
        address depositor,
        address token,
        uint256 depositId
    ) external view returns (DepositInfo memory);
}
