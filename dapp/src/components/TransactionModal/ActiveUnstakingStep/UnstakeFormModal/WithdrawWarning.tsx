import React from "react"
import { Box } from "@chakra-ui/react"
import { CurrencyType } from "#/types"
import { MINIMUM_BALANCE } from "#/constants"
import { formatSatoshiAmount, getCurrencyByType } from "#/utils"
import { TextMd } from "#/components/shared/Typography"
import { TOKEN_AMOUNT_FIELD_NAME } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { Alert, AlertTitle, AlertIcon } from "#/components/shared/Alert"
import { useFormField } from "#/hooks"

function WithdrawWarning({
  balance,
  currency,
}: {
  balance: bigint
  currency: CurrencyType
}) {
  const { value, isValid } = useFormField<bigint | undefined>(
    TOKEN_AMOUNT_FIELD_NAME,
  )
  const amount = value ?? 0n

  const { symbol } = getCurrencyByType(currency)

  const minimumBalanceText = `${formatSatoshiAmount(
    MINIMUM_BALANCE,
  )} ${symbol} `

  const newBalance = balance - amount
  const isMinimumBalanceExceeded = newBalance < MINIMUM_BALANCE

  if (isMinimumBalanceExceeded && isValid) {
    return (
      <Alert status="error">
        <AlertIcon status="error" />

        <TextMd as={AlertTitle}>
          The new balance is below the required minimum of
          <Box as="strong"> {minimumBalanceText}.</Box> Withdrawing your funds
          will result in the loss of your current rewards.
        </TextMd>
      </Alert>
    )
  }

  return (
    <Alert variant="elevated">
      <AlertIcon />

      <TextMd as={AlertTitle}>
        A minimum balance of
        <Box as="strong"> {minimumBalanceText}</Box> is required to keep all
        rewards active.
      </TextMd>
    </Alert>
  )
}

export default WithdrawWarning
