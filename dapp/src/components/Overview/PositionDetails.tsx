import React from "react"
import {
  Text,
  Button,
  Box,
  VStack,
  HStack,
  Tooltip,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react"
import { BITCOIN, FIAT_CURRENCY_USD } from "../../constants"
import { Info } from "../../static/icons"

export default function PositionDetails() {
  return (
    <VStack
      p="24px"
      h="100%"
      justifyContent="space-between"
      /* Unset alignItems to get a full-width button. */
      alignItems="unset"
    >
      <Box>
        <Text mb="8px">Your positions</Text>
        <VStack alignItems="flex-start" gap="0">
          <HStack>
            <Text>34.75</Text>
            <Text>{BITCOIN.token}</Text>
          </HStack>
          <HStack w="100%" justifyContent="space-between">
            <HStack>
              <Text>1.245.148,1</Text>
              <Text>{FIAT_CURRENCY_USD}</Text>
            </HStack>
            {/* TODO: Add correct text for tooltip */}
            <Tooltip label="Template">
              <Icon as={Info} color={useColorModeValue("black", "grey.80")} />
            </Tooltip>
          </HStack>
        </VStack>
      </Box>
      {/* Unset alignItems to get a full-width button. */}
      <VStack spacing="16px" alignItems="unset" width="100%">
        {/* TODO: Handle click actions */}
        <Button>Stake</Button>
        <Button variant="outline">Withdraw</Button>
      </VStack>
    </VStack>
  )
}
