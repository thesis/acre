import React from "react"
import { Flex, List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import { useTokenAmountFormValue } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
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
  const value = useTokenAmountFormValue() ?? 0n
  const details = useTransactionDetails(value)

  return (
    <Flex flexDirection="column" gap={10} mt={4}>
      {featureFlags.GAMIFICATION_ENABLED && (
        <WithdrawWarning balance={balance} currency={currency} amount={value} />
      )}
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
    </Flex>
  )
}

export default UnstakeDetails
