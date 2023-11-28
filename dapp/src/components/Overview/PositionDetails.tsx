import React from "react"
import {
  Text,
  Button,
  Box,
  HStack,
  Tooltip,
  Icon,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react"
import { BITCOIN, USD } from "../../constants"
import { Info } from "../../static/icons"

export default function PositionDetails() {
  return (
    <Flex p="24px" h="100%" direction="column" justifyContent="space-between">
      <Box>
        <Text mb="8px">Your positions</Text>
        <Flex direction="column" alignItems="flex-start">
          <HStack>
            <Text>34.75</Text>
            <Text>{BITCOIN.symbol}</Text>
          </HStack>
          <Flex w="100%" justifyContent="space-between">
            <HStack>
              <Text>1.245.148,1</Text>
              <Text>{USD.symbol}</Text>
            </HStack>
            {/* TODO: Add correct text for tooltip */}
            <Tooltip label="Template">
              <Icon as={Info} color={useColorModeValue("black", "grey.80")} />
            </Tooltip>
          </Flex>
        </Flex>
      </Box>
      <Flex direction="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button>Stake</Button>
        <Button variant="outline">Withdraw</Button>
      </Flex>
    </Flex>
  )
}
