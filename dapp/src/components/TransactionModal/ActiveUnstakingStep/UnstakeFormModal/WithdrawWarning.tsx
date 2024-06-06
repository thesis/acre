import React from "react"
import { Box } from "@chakra-ui/react"
import { CurrencyType } from "#/types"
import { MINIMUM_BALANCE } from "#/constants"
import { formatSatoshiAmount, getCurrencyByType } from "#/utils"
import { CardAlert } from "#/components/shared/alerts"
import { TextMd } from "#/components/shared/Typography"

function WithdrawWarning({
  balance,
  amount,
  currency,
}: {
  balance: bigint
  amount: bigint
  currency: CurrencyType
}) {
  const { symbol } = getCurrencyByType(currency)

  const minimumBalanceText = `${formatSatoshiAmount(
    MINIMUM_BALANCE,
  )} ${symbol} `

  const newBalance = balance - amount
  const isMinimumBalanceExceeded = newBalance < MINIMUM_BALANCE

  if (isMinimumBalanceExceeded) {
    return (
      // TODO: Update global styles for the Alert component
      // Previously, we distinguished more types of alerts.
      // The following styles should be moved to global styles and unneeded parts removed.
      <CardAlert
        status="error"
        bgColor="red.100"
        borderColor="red.400"
        colorIcon="red.400"
      >
        <TextMd pr={5}>
          The new balance is below the required minimum of
          <Box as="strong"> {minimumBalanceText}.</Box> Withdrawing your funds
          will result in the loss of your current rewards.
        </TextMd>
      </CardAlert>
    )
  }

  return (
    <CardAlert>
      <TextMd>
        A minimum balance of
        <Box as="strong"> {minimumBalanceText}</Box> is required to keep all
        rewards active.
      </TextMd>
    </CardAlert>
  )
}

export default WithdrawWarning
