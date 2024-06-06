import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import FeesDetailsAmountItem from "#/components/shared/FeesDetails/FeesItem"
import { useTokenAmountFormMeta } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FeesTooltip } from "#/components/TransactionModal/FeesTooltip"
import { useTransactionDetails } from "#/hooks"
import { CurrencyType, DepositFee } from "#/types"
import { useTransactionFee } from "#/hooks/useTransactionFee"

const mapDepositFeeToLabel = (feeId: keyof DepositFee) => {
  switch (feeId) {
    case "acre":
      return "Acre protocol fees"
    case "tbtc":
      return "tBTC bridge fees"
    default:
      return ""
  }
}

function StakeDetails({
  currency,
  minTokenAmount,
  maxTokenAmount,
}: {
  currency: CurrencyType
  minTokenAmount: bigint
  maxTokenAmount: bigint
}) {
  const value = useTokenAmountFormMeta()?.value ?? 0n
  const isMaximumValueExceeded = value > maxTokenAmount
  const isMinimumValueFulfilled = value >= minTokenAmount
  // Let's not calculate the details of the transaction when the value is not valid.
  const amount = !isMaximumValueExceeded && isMinimumValueFulfilled ? value : 0n
  const details = useTransactionDetails(amount)
  const { total, ...restFees } = useTransactionFee(amount)

  return (
    <List spacing={3} mt={10}>
      <TransactionDetailsAmountItem
        label="Amount to be staked"
        from={{
          currency,
          amount: details?.btcAmount,
        }}
        to={{
          currency: "usd",
        }}
      />
      <FeesDetailsAmountItem
        label="Fees"
        // TODO: Add `Bitcoin Network fee` (funding transaction fee selected by
        // the user) and figure out how to estimate this fee.
        tooltip={
          <FeesTooltip fees={restFees} mapFeeToLabel={mapDepositFeeToLabel} />
        }
        from={{
          currency,
          amount: total,
        }}
        to={{
          currency: "usd",
        }}
      />
      <TransactionDetailsAmountItem
        label="Approximately staked tokens"
        from={{
          currency,
          amount: details?.estimatedAmount,
        }}
        to={{
          currency: "usd",
        }}
      />
    </List>
  )
}

export default StakeDetails
