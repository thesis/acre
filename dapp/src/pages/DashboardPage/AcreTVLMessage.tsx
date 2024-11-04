import React from "react"
import { Box, HStack, StackProps, VStack } from "@chakra-ui/react"
import { useAllActivitiesCount, useStatistics, useWallet } from "#/hooks"
import { BoltFilled } from "#/assets/icons"
import { TextMd } from "#/components/shared/Typography"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"

type AcreTVLMessageProps = Omit<StackProps, "children">

export default function AcreTVLMessage(props: AcreTVLMessageProps) {
  const { tvl } = useStatistics()
  const { address } = useWallet()
  const activitiesCount = useAllActivitiesCount()

  const isWalletConnected = !!address
  const isFirstTimeUser = activitiesCount === 0

  if (isWalletConnected && !isFirstTimeUser && !tvl.isCapExceeded) {
    return null
  }

  return (
    <HStack align="start" spacing={1} color="grey.500" {...props}>
      <BoltFilled color="orange.400" my={1} />
      {tvl.isCapExceeded ? (
        <VStack align="start" spacing={0}>
          <TextMd fontWeight="semibold" color="grey.700">
            Deposit cap reached!
          </TextMd>
          <TextMd>Stay tuned for the next deposit cycle.</TextMd>
        </VStack>
      ) : (
        <TextMd as="div">
          <CurrencyBalance
            amount={tvl.remaining}
            currency="bitcoin"
            shouldBeFormatted={false}
            desiredDecimals={2}
            color="grey.700"
          />
          <Box as="span">&nbsp;remaining until deposit cap</Box>
        </TextMd>
      )}
    </HStack>
  )
}
