import React from "react"
import { Flex, List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import { useTokenAmountField } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useMinWithdrawAmount, useTransactionDetails } from "#/hooks"
import { ACTION_FLOW_TYPES, CurrencyType } from "#/types"
import { DESIRED_DECIMALS_FOR_FEE, featureFlags } from "#/constants"
import FeesDetailsAmountItem from "#/components/shared/FeesDetails/FeesItem"
import WithdrawWarning from "./WithdrawWarning"
import { FeesTooltip } from "../../FeesTooltip"

function UnstakeDetails({
  balance,
  currency,
}: {
  balance: bigint
  currency: CurrencyType
}) {
  const { value = 0n } = useTokenAmountField()
  const minWithdrawAmount = useMinWithdrawAmount()
  const amount = value >= minWithdrawAmount ? value : 0n
  const details = useTransactionDetails(amount, ACTION_FLOW_TYPES.UNSTAKE)

  const { total, ...restFees } = details.transactionFee

  return (
    <Flex flexDirection="column" gap={10} mt={4}>
      {featureFlags.GAMIFICATION_ENABLED && (
        <WithdrawWarning balance={balance} currency={currency} />
      )}
      <List spacing={3}>
        <TransactionDetailsAmountItem
          label="Withdraw from pool"
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
            withRoundUp: true,
          }}
          to={{
            currency: "usd",
          }}
        />
        <TransactionDetailsAmountItem
          label="You will receive"
          from={{
            currency,
            amount: details.estimatedAmount,
          }}
          to={{
            currency: "usd",
          }}
        />
      </List>
    </Flex>
  )
}

export default UnstakeDetails
