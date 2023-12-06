import React from "react"
import { HStack, Text, Flex } from "@chakra-ui/react"
import { Currency } from "../../types"
import { formatTokenAmount } from "../../utils"
import { USD } from "../../constants"

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
        <Text>
          {formatTokenAmount(tokenBalance, currency.decimals, desiredDecimals)}
        </Text>
        <Text>{currency.symbol}</Text>
      </HStack>
      {usdBalance && (
        // TODO: Set the correct color
        <HStack color="gray.500">
          <Text>{usdBalance}</Text>
          <Text>{USD.symbol}</Text>
        </HStack>
      )}
    </Flex>
  )
}
