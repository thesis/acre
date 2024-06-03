import React from "react"
import { Highlight } from "@chakra-ui/react"
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
      <CardAlert status="error">
        <TextMd pr={5}>
          <Highlight query={minimumBalanceText} styles={{ fontWeight: "bold" }}>
            {`The new balance is below the required minimum of ${minimumBalanceText}. Withdrawing  your funds will result in the loss of your current rewards.`}
          </Highlight>
        </TextMd>
      </CardAlert>
    )
  }

  return (
    <CardAlert>
      <TextMd>
        <Highlight query={minimumBalanceText} styles={{ fontWeight: "bold" }}>
          {`A minimum balance of ${minimumBalanceText} is required to keep all rewards active.`}
        </Highlight>
      </TextMd>
    </CardAlert>
  )
}

export default WithdrawWarning
