import React from "react"
import { Box, HStack, StackProps, VStack, Text } from "@chakra-ui/react"
import { useActivitiesCount, useStatistics, useWallet } from "#/hooks"
import { IconBolt } from "@tabler/icons-react"
import CurrencyBalance from "#/components/CurrencyBalance"

type AcreTVLMessageProps = Omit<StackProps, "children">

export default function AcreTVLMessage(props: AcreTVLMessageProps) {
  const { tvl } = useStatistics()
  const { isConnected } = useWallet()
  const activitiesCount = useActivitiesCount()

  const isFirstTimeUser = activitiesCount === 0

  if (isConnected && !isFirstTimeUser && !tvl.isCapExceeded) {
    return null
  }

  return (
    <HStack align="start" spacing={1} color="text.tertiary" {...props}>
      <Box color="orange.400" margin="auto">
        <IconBolt fill="currentColor" size={16} />
      </Box>
      {tvl.isCapExceeded ? (
        <VStack align="start" spacing={0}>
          <Text size="md" fontWeight="semibold" color="text.primary">
            Deposit cap reached!
          </Text>
          <Text size="md">Stay tuned for the next deposit cycle.</Text>
        </VStack>
      ) : (
        <Text size="md" as="div">
          <CurrencyBalance
            amount={tvl.remaining}
            currency="bitcoin"
            shouldBeFormatted={false}
            desiredDecimals={2}
            color="text.primary"
          />
          <Box as="span">&nbsp;remaining until deposit cap</Box>
        </Text>
      )}
    </HStack>
  )
}
