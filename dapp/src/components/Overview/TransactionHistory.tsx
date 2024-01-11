import React from "react"
import {
  CardBody,
  Card,
  CardProps,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react"
import ProtocolHistory from "../TransactionHistory/Protocol"
import AccountHistory from "../TransactionHistory/Account"

export default function TransactionHistory(props: CardProps) {
  return (
    <Card {...props}>
      <CardBody>
        <Tabs variant="underline">
          <TabList>
            <Tab>Account history</Tab>
            <Tab>Protocol history</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <AccountHistory />
            </TabPanel>
            <TabPanel>
              <ProtocolHistory />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  )
}
