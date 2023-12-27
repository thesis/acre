import React from "react"
import {
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react"
import { ModalStep } from "../../../contexts"
import StakeForm from "../Staking/StakeForm"

const TABS = ["stake", "unstake"] as const

type FormType = (typeof TABS)[number]

type ActionFormProps = { defaultForm: FormType } & ModalStep

function ActionForm({ defaultForm, goNext }: ActionFormProps) {
  return (
    <ModalBody>
      <Tabs
        w="100%"
        variant="underline"
        defaultIndex={TABS.indexOf(defaultForm)}
      >
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
