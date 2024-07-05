import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import FeesDetailsAmountItem from "#/components/shared/FeesDetails/FeesItem"
import { useTokenAmountField } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FeesTooltip } from "#/components/TransactionModal/FeesTooltip"
import { useTransactionDetails } from "#/hooks"
import { CurrencyType } from "#/types"

function StakeDetails({ currency }: { currency: CurrencyType }) {
  const { value, isValid } = useTokenAmountField()
  // Let's not calculate the details of the transaction when the value is not valid.
  const amount = isValid ? value : 0n
  const details = useTransactionDetails(amount)
  const { total, ...restFees } = details.transactionFee

  return (
    <List spacing={3} mt={10}>
      <TransactionDetailsAmountItem
        label="Amount to be staked"
        from={{
          currency,
          amount: details.amount,
        }}
        to={{
          currency: "usd",
        }}
      />
      <FeesDetailsAmountItem
        label="Fees"
        // TODO: Add `Bitcoin Network fee` (funding transaction fee selected by
        // the user) and figure out how to estimate this fee.
        tooltip={<FeesTooltip fees={restFees} />}
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
          amount: details.estimatedAmount,
        }}
        to={{
          currency: "usd",
        }}
      />
    </List>
  )
}

export default StakeDetails
