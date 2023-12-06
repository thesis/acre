import React from "react"
import { HStack, Flex } from "@chakra-ui/react"
import { Currency } from "../../types"
import { formatTokenAmount } from "../../utils"
import { USD } from "../../constants"
import { TextMd, TextSm } from "../Typography"

type TokenBalanceProps = {
  currency: Currency
  tokenBalance: string | number
  usdBalance?: string
  desiredDecimals?: number
  alignItems?: "end" | "start"
}

export function TokenBalance({
  currency,
  tokenBalance,
  usdBalance,
  desiredDecimals = 2,
  alignItems = "end",
}: TokenBalanceProps) {
  return (
    <Flex direction="column" alignItems={alignItems}>
      <HStack>
        <TextMd>
          {formatTokenAmount(tokenBalance, currency.decimals, desiredDecimals)}
        </TextMd>
        <TextMd>{currency.symbol}</TextMd>
      </HStack>
      {usdBalance && (
        // TODO: Set the correct color
        <HStack color="gray.500">
          <TextSm>{usdBalance}</TextSm>
          <TextSm>{USD.symbol}</TextSm>
        </HStack>
      )}
    </Flex>
  )
}
