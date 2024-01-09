import React from "react"
import { List } from "@chakra-ui/react"
import { useField } from "formik"
import { useTransactionDetails } from "../../../../hooks"
import TransactionDetailsAmountItem from "../../../shared/TransactionDetails/AmountItem"
import { CurrencyType } from "../../../../types"

function Details({
  fieldName,
  currencyType,
}: {
  fieldName: string
  currencyType: CurrencyType
}) {
  const [, { value }] = useField(fieldName)
  const btcAmount = value ?? 0n

  const { protocolFee, estimatedAmount } = useTransactionDetails(btcAmount)

  return (
    <List spacing={3} mt={10}>
      <TransactionDetailsAmountItem
        label="Amount to be staked"
        from={{
          currencyType,
          amount: value ?? 0n,
        }}
        to={{
          currencyType: "usd",
          amount: "11212",
          shouldBeFormatted: false,
        }}
      />
      <TransactionDetailsAmountItem
        label="Protocol fee (0.01%)"
        from={{
          currencyType,
          amount: protocolFee,
        }}
        to={{
          currencyType: "usd",
          amount: "11212",
          shouldBeFormatted: false,
        }}
      />
      <TransactionDetailsAmountItem
        label="Approximately staked tokens"
        from={{
          currencyType,
          amount: estimatedAmount,
        }}
        to={{
          currencyType: "usd",
          amount: "11212",
          shouldBeFormatted: false,
        }}
      />
    </List>
  )
}

export default Details
