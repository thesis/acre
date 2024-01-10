import React from "react"
import {
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react"
import StakeForm from "../Staking/StakeForm"
import { useModalFlowContext } from "../../../hooks"

const TABS = ["stake", "unstake"] as const

type Action = (typeof TABS)[number]

function ActionForm({ action }: { action: Action }) {
  const { goNext } = useModalFlowContext()

  return (
    <ModalBody>
      <Tabs w="100%" variant="underline" defaultIndex={TABS.indexOf(action)}>
        <TabList>
          {TABS.map((tab) => (
            <Tab key={tab} w="50%">
              {tab}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <StakeForm goNext={goNext} />
          </TabPanel>
          <TabPanel>{/* TODO: Add form for unstake */}</TabPanel>
        </TabPanels>
      </Tabs>
    </ModalBody>
  )
}

export default ActionForm
