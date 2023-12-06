import React from "react"
import {
  Text,
  Button,
  HStack,
  Tooltip,
  Icon,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react"
import { BITCOIN, USD } from "../../constants"
import { Info } from "../../static/icons"
import Staking from "../Staking"
import { useStakingFlowContext } from "../../hooks"

export default function PositionDetails() {
  const { setModalType } = useStakingFlowContext()

  return (
    <>
      <Flex p={4} h="100%" direction="column" justifyContent="space-between">
        <Flex direction="column" gap={2}>
          <Text>Your positions</Text>
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
        </Flex>
        <Flex direction="column" gap={2}>
          {/* TODO: Handle click actions */}
          <Button onClick={() => setModalType("overview")}>Stake</Button>
          <Button variant="outline">Withdraw</Button>
        </Flex>
      </Flex>
      <Staking />
    </>
  )
}
