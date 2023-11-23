import React from "react"
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import AccountHistory from "./AccountHistory"
import ProtocolHistory from "./ProtocolHistory"

export default function TransactionHistory() {
  return (
    <Tabs>
      <TabList>
        <Tab>Protocol history</Tab>
        <Tab>Account history</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ProtocolHistory />
        </TabPanel>
        <TabPanel>
          <AccountHistory />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
