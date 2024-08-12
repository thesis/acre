import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import FeesDetailsAmountItem from "#/components/shared/FeesDetails/FeesItem"
import { useTokenAmountField } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FeesTooltip } from "#/components/TransactionModal/FeesTooltip"
import { useMinDepositAmount, useTransactionDetails } from "#/hooks"
import { CurrencyType } from "#/types"
import { DESIRED_DECIMALS_FOR_FEE, FEE_CEIL_PRECISION } from "#/constants"

function StakeDetails({ currency }: { currency: CurrencyType }) {
  const { value = 0n } = useTokenAmountField()
  const minDepositAmount = useMinDepositAmount()
  const amount = value >= minDepositAmount ? value : 0n
  const details = useTransactionDetails(amount)
  const { total, ...restFees } = details.transactionFee

  return (
    <List spacing={3} mt={10}>
      <TransactionDetailsAmountItem
        label="Amount to be deposited"
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
          desiredDecimals: DESIRED_DECIMALS_FOR_FEE,
          ceilPrecision: FEE_CEIL_PRECISION,
        }}
        to={{
          currency: "usd",
        }}
      />
      <TransactionDetailsAmountItem
        label="Approximate staked tokens"
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
