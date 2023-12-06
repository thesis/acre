import React from "react"
import {
  Button,
  ModalBody,
  ModalFooter,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react"
import { useStakingFlowContext, useWalletContext } from "../../hooks"
import BaseModal from "./BaseModal"
import { TokenBalance } from "../TokenBalance"
import { BITCOIN } from "../../constants"
import { TextMd } from "../Typography"
import TokenBalanceInput from "../TokenBalanceInput"

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
      <TextMd>{text}</TextMd>
      <TokenBalance
        tokenBalance={tokenBalance}
        currency={BITCOIN}
        usdBalance={usdBalance}
      />
    </Flex>
  )
}

export default function StakeModal() {
  const { amount, setAmount, closeModal } = useStakingFlowContext()
  const { btcAccount } = useWalletContext()

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
                {/* TODO: Add a validation */}
                <TokenBalanceInput
                  amount={amount}
                  // TODO: Use the real data
                  usdAmount="45.725,91"
                  tokenBalance={btcAccount?.balance.toString() ?? 0}
                  currency={BITCOIN}
                  placeholder={BITCOIN.symbol}
                  onChange={(value) => setAmount(value)}
                />
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
