import React, { useMemo } from "react"
import {
  Button,
  Flex,
  HStack,
  Icon,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import { TokenBalance } from "../TokenBalance"
import { Currency } from "../../types"
import { fixedPointNumberToString } from "../../utils"
import { Alert } from "../../static/icons"
import { USD } from "../../constants"
import { TextMd, TextSm } from "../Typography"

export default function TokenBalanceInput({
  amount,
  usdAmount,
  currency,
  tokenBalance,
  placeholder,
  onChange,
}: {
  amount?: string
  usdAmount?: string
  currency: Currency
  tokenBalance: string | number
  placeholder?: string
  onChange: (value: string) => void
}) {
  // TODO: Set the correct color
  const colorInfo = useColorModeValue("grey.200", "grey.200")

  const tokenBalanceAmount = useMemo(
    () =>
      fixedPointNumberToString(BigInt(tokenBalance || 0), currency.decimals),
    [currency.decimals, tokenBalance],
  )

  return (
    <Flex direction="column" gap={2}>
      <Flex justifyContent="space-between">
        <TextMd>Amount</TextMd>
        <HStack>
          <TextMd>Balance</TextMd>
          <TokenBalance tokenBalance={tokenBalance} currency={currency} />
        </HStack>
      </Flex>
      <InputGroup>
        <NumberInput
          w="100%"
          min={0}
          value={amount}
          onChange={(valueString) => onChange(valueString)}
        >
          <NumberInputField placeholder={placeholder} />
        </NumberInput>
        <InputRightElement width="5rem">
          <Button h="1.75rem" onClick={() => onChange(tokenBalanceAmount)}>
            Max
          </Button>
        </InputRightElement>
      </InputGroup>
      <HStack>
        {/* TODO: Add correct text for tooltip */}
        <Tooltip label="Template">
          <Icon as={Alert} color={colorInfo} />
        </Tooltip>
        <TextSm color={colorInfo}>{`${usdAmount} ${USD.symbol}`}</TextSm>
      </HStack>
    </Flex>
  )
}
