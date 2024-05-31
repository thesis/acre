import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import { useTokenAmountFormValue } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useTransactionDetails } from "#/hooks"
import { CurrencyType } from "#/types"

function UnstakeDetails({ currency }: { currency: CurrencyType }) {
  const value = useTokenAmountFormValue()
  const details = useTransactionDetails(value ?? 0n)

  return (
    <List spacing={3}>
      <TransactionDetailsAmountItem
        label="Withdraw from pool"
        from={{
          currency,
          amount: details?.btcAmount,
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
        label="You will receive"
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

export default UnstakeDetails
