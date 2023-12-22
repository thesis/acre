/* eslint-disable no-console */
import React from "react"
import {
  Button,
  Tooltip,
  Icon,
  CardBody,
  Card,
  CardFooter,
  HStack,
  CardProps,
  useBoolean,
} from "@chakra-ui/react"
import {
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { Info } from "../../static/icons"
import StakingModal from "../Modals/Staking"
import { CurrencyBalanceWithConversion } from "../shared/CurrencyBalanceWithConversion"
import { TextMd } from "../shared/Typography"
import { useWalletContext } from "../../hooks"

export default function PositionDetails(props: CardProps) {
  const [isOpenStakingModal, stakingModal] = useBoolean()
  const { ethAccount } = useWalletContext()

  async function verifyAccountAddress(
    walletApiClient: WalletAPIClient,
    accountId: string,
  ) {
    try {
      const address = await walletApiClient.account.receive(accountId)
      console.log("Verified address:", address)
    } catch (error) {
      console.error("Error verifying account address:", error)
    }
  }

  async function initializeWalletApiClient() {
    if (ethAccount) {
      try {
        // Step 1: Initialize and connect the Window Message Transport
        const windowMessageTransport = new WindowMessageTransport()
        windowMessageTransport.connect()

        // Step 2: Initialize Wallet API Client with the Window Message Transport
        const walletApiClient = new WalletAPIClient(windowMessageTransport)

        // The Wallet API client is now initialized, and you can use it to interact with Wallet API.
        await verifyAccountAddress(walletApiClient, ethAccount.id)

        // Step 3: Disconnect when done to ensure the communication is properly closed
        windowMessageTransport.disconnect()
      } catch (error) {
        console.error("Error:", error)
      }
    } else {
      console.log("Ethereum account not installed")
    }
  }

  return (
    <Card {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <TextMd fontWeight="bold">Your position</TextMd>
          {/* TODO: Add correct text for tooltip */}
          <Tooltip label="Template" placement="top">
            <Icon as={Info} color="grey.700" />
          </Tooltip>
        </HStack>
        <CurrencyBalanceWithConversion
          from={{
            currencyType: "bitcoin",
            amount: "2398567898",
            variant: "greater-balance",
          }}
          to={{
            currencyType: "usd",
            amount: 419288.98,
            shouldBeFormatted: false,
            size: "lg",
          }}
        />
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button size="lg" onClick={stakingModal.on}>
          Stake
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={async () => {
            await initializeWalletApiClient()
          }}
        >
          Verify address
        </Button>
      </CardFooter>
      <StakingModal isOpen={isOpenStakingModal} onClose={stakingModal.off} />
    </Card>
  )
}
