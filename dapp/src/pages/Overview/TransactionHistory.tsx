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
import { useWalletContext } from "#/hooks"
import AccountHistory from "#/components/TransactionHistory/Account"
import ProtocolHistory from "#/components/TransactionHistory/Protocol"

export default function TransactionHistory(props: CardProps) {
  const { isConnected } = useWalletContext()

  return (
    <Card {...props}>
      <CardBody>
        <Tabs variant="underline">
          <TabList>
            {isConnected && <Tab>Account history</Tab>}
            <Tab>Protocol history</Tab>
          </TabList>
          <TabPanels>
            {isConnected && (
              <TabPanel>
                <AccountHistory />
              </TabPanel>
            )}
            <TabPanel>
              <ProtocolHistory />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  )
}
