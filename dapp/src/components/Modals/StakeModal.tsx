import React from "react"
import {
  Button,
  ModalBody,
  ModalFooter,
  Text,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react"
import { useStakingFlowContext } from "../../hooks"
import BaseModal from "./BaseModal"
import { TokenBalance } from "../TokenBalance"
import { BITCOIN } from "../../constants"

function StakeDetails({
  text,
  tokenBalance,
  usdBalance,
}: {
  text: string
  tokenBalance: string
  usdBalance: string
}) {
  return (
    <Flex justifyContent="space-between">
      <Text>{text}</Text>
      <TokenBalance
        tokenBalance={tokenBalance}
        currency={BITCOIN}
        usdBalance={usdBalance}
      />
    </Flex>
  )
}

export default function StakeModal() {
  const { closeModal } = useStakingFlowContext()

  return (
    <BaseModal>
      <ModalBody>
        <Tabs variant="underline">
          <TabList justifyContent="center" gap={32} mb={6}>
            <Tab>Stake</Tab>
            {/* TODO: Add a content for unstake tab */}
            <Tab>Unstake</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Flex gap={12} direction="column">
                {/* TODO: Create a custom number input component */}
                <NumberInput>
                  <NumberInputField />
                  <NumberInputStepper />
                </NumberInput>
                <Flex gap={4} direction="column" w="100%">
                  {/* TODO: Use the real data */}
                  <StakeDetails
                    text="Amount to be staked"
                    tokenBalance="179776555"
                    usdBalance="45.725,91"
                  />
                  <StakeDetails
                    text="Protocol fee (0.01%)"
                    tokenBalance="20"
                    usdBalance="0.024,91"
                  />
                  <StakeDetails
                    text="Approximately staked tokens"
                    tokenBalance="13456775"
                    usdBalance="44.762,21"
                  />
                </Flex>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>
      <ModalFooter>
        <Button width="100%" onClick={closeModal}>
          Stake
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}
