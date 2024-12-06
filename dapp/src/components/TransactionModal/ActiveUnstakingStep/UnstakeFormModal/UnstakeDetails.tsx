import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/AmountItem"
import { TOKEN_AMOUNT_FIELD_NAME } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import {
  useFormField,
  useMinWithdrawAmount,
  useTransactionDetails,
} from "#/hooks"
import { ACTION_FLOW_TYPES, CurrencyType } from "#/types"
import { DESIRED_DECIMALS_FOR_FEE } from "#/constants"
import FeesDetailsAmountItem from "#/components/shared/FeesDetails/FeesItem"
import { FeesTooltip } from "../../FeesTooltip"

function UnstakeDetails({ currency }: { currency: CurrencyType }) {
  const { value = 0n } = useFormField<bigint | undefined>(
    TOKEN_AMOUNT_FIELD_NAME,
  )
  const minWithdrawAmount = useMinWithdrawAmount()
  const amount = value >= minWithdrawAmount ? value : 0n
  const details = useTransactionDetails(amount, ACTION_FLOW_TYPES.UNSTAKE)

  const { total, ...restFees } = details.transactionFee

  return (
    <List spacing={3} mt={10}>
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
      />
    </List>
  )
}

export default UnstakeDetails
