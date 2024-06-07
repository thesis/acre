import React from "react"
import { Flex, List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import {
  useTokenAmountFormValue,
  useTokenAmountIsValid,
} from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useTransactionDetails } from "#/hooks"
import { CurrencyType } from "#/types"
import { featureFlags } from "#/constants"
import WithdrawWarning from "./WithdrawWarning"

function UnstakeDetails({
  balance,
  currency,
}: {
  balance: bigint
  currency: CurrencyType
}) {
  const value = useTokenAmountFormValue()
  const isValid = useTokenAmountIsValid()
  // Let's not calculate the details of the transaction when the value is not valid.
  const amount = isValid ? value : 0n
  const details = useTransactionDetails(amount)

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
