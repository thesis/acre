import React from "react"
import { Box, Flex, VStack } from "@chakra-ui/react"
import { useField } from "formik"
import { CurrencyBalanceWithConversion } from "../CurrencyBalanceWithConversion"
import { TextMd } from "../Typography"
import { TransactionType } from "../../../types"

const DETAILS: Record<
  TransactionType,
  {
    btcAmountText: string
    protocolFeeText: string
    estimatedAmountText: string
  }
> = {
  stake: {
    btcAmountText: "Amount to be staked",
    protocolFeeText: "Protocol fee (0.01%)",
    estimatedAmountText: "Approximately staked tokens",
  },
  unstake: {
    btcAmountText: "Amount to be unstaked from the pool",
    protocolFeeText: "Protocol fee (0.01%)",
    estimatedAmountText: "Approximately unstaked tokens",
  },
}

function TransactionDetailsItem({
  text,
  btcAmount,
  usdAmount,
}: {
  text: string
  btcAmount: string | number
  usdAmount: string
}) {
  return (
    <Flex justifyContent="space-between" w="100%">
      <TextMd fontWeight="semibold" color="grey.700">
        {text}
      </TextMd>
      <Box textAlign="end">
        <CurrencyBalanceWithConversion
          from={{
            currencyType: "bitcoin",
            amount: btcAmount,
            shouldBeFormatted: false,
          }}
          to={{
            currencyType: "usd",
            amount: usdAmount,
            shouldBeFormatted: false,
            size: "sm",
            fontWeight: "medium",
            color: "grey.500",
          }}
        />
      </Box>
    </Flex>
  )
}

function TransactionDetails({
  fieldName,
  type,
}: {
  fieldName: string
  type: TransactionType
}) {
  const [, { value }] = useField(fieldName)

  const { btcAmountText, protocolFeeText, estimatedAmountText } = DETAILS[type]

  // TODO: Let's simplify it and secure edge cases
  const btcAmount = parseFloat(value) || 0
  const protocolFee = btcAmount * 0.01
  const stakedAmount = btcAmount - protocolFee

  return (
    <VStack gap={3} mt={10}>
      <TransactionDetailsItem
        text={btcAmountText}
        btcAmount={btcAmount}
        usdAmount="45.725,91"
      />
      <TransactionDetailsItem
        text={protocolFeeText}
        btcAmount={protocolFee}
        usdAmount="0.024,91"
      />
      <TransactionDetailsItem
        text={estimatedAmountText}
        btcAmount={stakedAmount}
        usdAmount="44.762,21"
      />
    </VStack>
  )
}

export default TransactionDetails
