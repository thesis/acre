import React from "react"
import { List } from "@chakra-ui/react"
import { useField } from "formik"
import { useTransactionDetails } from "../../../../hooks"
import TransactionDetailsAmountItem from "../../../shared/TransactionDetails/AmountItem"
import { Currency } from "../../../../types"

function Details({
  fieldName,
  currency,
}: {
  fieldName: string
  currency: Currency
}) {
  const [, { value }] = useField(fieldName)
  const btcAmount = value ?? 0n

  const { protocolFee, estimatedAmount } = useTransactionDetails(btcAmount)

  return (
    <List spacing={3} mt={10}>
      <TransactionDetailsAmountItem
        label="Amount to be staked"
        from={{
          currency,
          amount: btcAmount,
        }}
        to={{
          currency: "usd",
        }}
      />
      <TransactionDetailsAmountItem
        label="Protocol fee (0.01%)"
        from={{
          currency,
          amount: protocolFee,
        }}
        to={{
          currency: "usd",
        }}
      />
      <TransactionDetailsAmountItem
        label="Approximately staked tokens"
        from={{
          currency,
          amount: estimatedAmount,
        }}
        to={{
          currency: "usd",
        }}
      />
    </List>
  )
}

export default Details
