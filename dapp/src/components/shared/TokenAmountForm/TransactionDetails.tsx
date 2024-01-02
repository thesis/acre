import React from "react"
import { Box, Flex, VStack } from "@chakra-ui/react"
import { useField } from "formik"
import { CurrencyBalanceWithConversion } from "../CurrencyBalanceWithConversion"
import { TextMd } from "../Typography"

// TODO: Use data from the SDK
function getTransactionDetails(value: string):
  | {
      btcAmount: string
      protocolFee: string
      stakedAmount: string
    }
  | undefined {
  const btcAmount = value ?? 0n
  const btcAmountInBI = BigInt(btcAmount)

  if (btcAmountInBI <= 0n) return undefined

  const protocolFee = btcAmountInBI / 10000n
  const stakedAmount = btcAmountInBI - protocolFee

  return {
    btcAmount,
    protocolFee: protocolFee.toString(),
    stakedAmount: stakedAmount.toString(),
  }
}

function TransactionDetailsItem({
  text,
  btcAmount,
  usdAmount,
}: {
  text: string
  btcAmount?: string | number
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
  btcAmountText,
  estimatedAmountText,
}: {
  fieldName: string
  btcAmountText: string
  estimatedAmountText: string
}) {
  const [, { value }] = useField(fieldName)

  const details = getTransactionDetails(value)

  return (
    <VStack gap={3} mt={10}>
      <TransactionDetailsItem
        text={btcAmountText}
        btcAmount={details?.btcAmount}
        usdAmount="45.725,91"
      />
      <TransactionDetailsItem
        // TODO: Use protocol fee from the SDK
        text="Protocol fee (0.01%)"
        btcAmount={details?.protocolFee}
        usdAmount="0.024,91"
      />
      <TransactionDetailsItem
        text={estimatedAmountText}
        btcAmount={details?.stakedAmount}
        usdAmount="44.762,21"
      />
    </VStack>
  )
}

export default TransactionDetails
