import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import { useTokenAmountFormValue } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useTransactionDetails } from "#/hooks"
import { CurrencyType } from "#/types"

function UnstakeDetails({ currency }: { currency: CurrencyType }) {
  const value = useTokenAmountFormValue() ?? 0n
  const details = useTransactionDetails(value)

  return (
    <List spacing={3} mt={10}>
      <TransactionDetailsAmountItem
        label="Amount to be unstaked from the pool"
        from={{
          currency,
          amount: details.amount,
        }}
        to={{
          currency: "usd",
        }}
      />
      {/* TODO: Uncomment when unstaking fees are ready.  */}
      {/* <FeesDetailsAmountItem
        label="Fees"
        sublabel="How are fees calculated?"
        tooltip={<FeesTooltip fees={{}} />}
        from={{
          currency,
          amount: transactionFee.total,
        }}
        to={{
          currency: "usd",
        }}
      /> */}
      <TransactionDetailsAmountItem
        label="Approximately unstaked tokens"
        from={{
          currency,
          amount: details.estimatedAmount,
        }}
        to={{
          currency: "usd",
        }}
      />
    </List>
  )
}

export default UnstakeDetails
