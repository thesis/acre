import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import FeesDetailsAmountItem from "#/components/shared/FeesDetails/FeesItem"
import { useTokenAmountFormValue } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FeesTooltip } from "#/components/TransactionModal/FeesTooltip"
import { useTransactionDetails } from "#/hooks"
import { CurrencyType } from "#/types"

function UnstakeDetails({ currency }: { currency: CurrencyType }) {
  const value = useTokenAmountFormValue()
  const details = useTransactionDetails(value ?? 0n)

  return (
    <List spacing={3} mt={10}>
      <TransactionDetailsAmountItem
        label="Amount to be unstaked from the pool"
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
        sublabel="How are fees calculated?"
        tooltip={<FeesTooltip />}
        from={{
          currency,
          amount: details?.protocolFee,
        }}
        to={{
          currency: "usd",
        }}
      />
      <TransactionDetailsAmountItem
        label="Approximately unstaked tokens"
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
