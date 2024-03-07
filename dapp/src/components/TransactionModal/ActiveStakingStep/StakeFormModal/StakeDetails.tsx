import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import { useTokenAmountFormValue } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useTransactionDetails } from "#/hooks"
import { CurrencyType } from "#/types"

function StakeDetails({
  currency,
  minTokenAmount,
  maxTokenAmount,
}: {
  currency: CurrencyType
  minTokenAmount: bigint
  maxTokenAmount: bigint
}) {
  const value = useTokenAmountFormValue() ?? 0n
  const isMaximumValueExceeded = value > maxTokenAmount
  const isMinimumValueFulfilled = value >= minTokenAmount
  // Let's not calculate the details of the transaction when the value is not valid.
  const amount = !isMaximumValueExceeded && isMinimumValueFulfilled ? value : 0n
  const details = useTransactionDetails(amount)

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
      <TransactionDetailsAmountItem
        label="Protocol fee (0.01%)"
        from={{
          currency,
          amount: details?.protocolFee,
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
