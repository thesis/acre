import React from "react"
import { List } from "@chakra-ui/react"
import TransactionDetailsAmountItem from "#/components/shared/TransactionDetails/TransactionDetailsAmountItem"
import FeesDetailsAmountItem from "#/components/shared/FeesDetails/FeesDetailsAmountItem"
import { TOKEN_AMOUNT_FIELD_NAME } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FeesTooltip } from "#/components/TransactionModal/FeesTooltip"
import {
  useFormField,
  useMinDepositAmount,
  useTransactionDetails,
} from "#/hooks"
import { CurrencyType } from "#/types"
import { DESIRED_DECIMALS_FOR_FEE } from "#/constants"

function StakeDetails({ currency }: { currency: CurrencyType }) {
  const { value = 0n } = useFormField<bigint | undefined>(
    TOKEN_AMOUNT_FIELD_NAME,
  )
  const minDepositAmount = useMinDepositAmount()
  const amount = value >= minDepositAmount ? value : 0n
  const details = useTransactionDetails(amount)
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
        label="You will deposit"
        from={{
          currency,
          amount: details.estimatedAmount,
        }}
      />
    </List>
  )
}

export default StakeDetails
