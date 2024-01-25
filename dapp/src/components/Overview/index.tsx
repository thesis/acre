import React, { useCallback } from "react"
import { Button, Flex, Grid, HStack, Icon, Switch } from "@chakra-ui/react"
import { useDocsDrawer, useWalletContext } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import { ArrowUpRight } from "#/static/icons"
import { USD } from "#/constants"
import { useStakeFlow } from "#/acre-react/hooks"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { useAcreContext } from "../../acre-react/AcreSdkContext"

export default function Overview() {
  const { onOpen } = useDocsDrawer()
  const { ethAccount } = useWalletContext()
  const ethAddress = ethAccount?.address

  const { init, isInitialized } = useAcreContext()
  const { initStake, btcAddress, signMessage, stake } = useStakeFlow()

  const initSDK = useCallback(async () => {
    if (!ethAddress) return

    await init(ethAddress, "goerli")
  }, [ethAddress, init])

  return (
    <Flex direction="column" gap={2} p={6}>
      <Flex justifyContent="space-between" alignItems="center">
        <HStack>
          {/* TODO: Handle click actions */}
          <Switch size="sm" />
          <TextSm fontWeight="bold">Show values in {USD.symbol}</TextSm>
          <Button
            isDisabled={isInitialized || !ethAddress}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={initSDK}
          >
            Connect sdk
          </Button>
          <Button
            isDisabled={!isInitialized}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={async () => {
              await initStake("mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc", ethAddress!)
            }}
          >
            Initialize stake
          </Button>
          <Button
            isDisabled={!btcAddress}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={signMessage}
          >
            Sign message
          </Button>
          <TextSm>Deposit address: {btcAddress ?? "not available yet"}</TextSm>
          <Button
            isDisabled={!btcAddress}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={stake}
          >
            Stake
          </Button>
        </HStack>
        <Button
          variant="card"
          onClick={onOpen}
          leftIcon={<Icon as={ArrowUpRight} color="brand.400" boxSize={4} />}
        >
          Docs
        </Button>
      </Flex>
      <Grid
        templateAreas={`"position-details statistics"
                        "transaction-history transaction-history"`}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
        gridTemplateRows={{ base: "55% 1fr", xl: "40% 1fr" }}
        h="75vh"
        gap={4}
      >
        <PositionDetails gridArea="position-details" />
        <Statistics gridArea="statistics" />
        <TransactionHistory gridArea="transaction-history" />
      </Grid>
    </Flex>
  )
}
