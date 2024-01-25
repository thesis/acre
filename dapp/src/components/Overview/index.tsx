import React, { useCallback, useState } from "react"
import { Button, Flex, Grid, HStack, Switch } from "@chakra-ui/react"
import { useDocsDrawer, useWalletContext } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import { EthereumAddress } from "sdk/dist/src/lib/ethereum"
import { StakeInitialization } from "sdk/dist/src/modules/staking/stake-initialization"
import { useAcreContext } from "#/acre-react"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"

export default function Overview() {
  const { onOpen } = useDocsDrawer()
  const [stake, setStake] = useState<StakeInitialization | undefined>(undefined)
  const [btcAddress, setBtcAddress] = useState<string | undefined>(undefined)
  const { ethAccount } = useWalletContext()

  const ethAddress = ethAccount?.address

  const { init, acre, isInitialized } = useAcreContext()

  const initSDK = useCallback(async () => {
    if (!ethAddress) return

    await init(ethAddress)
  }, [ethAddress, init])

  const signMessage = useCallback(async () => {
    if (!stake) return

    await stake.signMessage()
  }, [stake])

  const stakeBTC = useCallback(async () => {
    if (!stake) return

    await stake.stake()
  }, [stake])

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
              const stakeFlow = await acre?.staking.initializeStake(
                "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc",
                EthereumAddress.from(
                  "0xafB62Ac8Fec36dFeD78094D5F7592558ddcf7FE8",
                ),
                123,
              )
              setStake(stakeFlow)
            }}
          >
            Initialize stake
          </Button>
          <Button
            isDisabled={!stake}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={async () => {
              setBtcAddress(await stake?.getBitcoinAddress())
            }}
          >
            Get BTC deposit address
          </Button>

          <Button
            isDisabled={!btcAddress}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={signMessage}
          >
            Sign message
          </Button>
          <TextSm>Deposit address: {btcAddress}</TextSm>
          <Button
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={stakeBTC}
          >
            Stake
          </Button>
        </HStack>
        <ButtonLink colorScheme="gold" bg="gold.200" onClick={onOpen}>
          Docs
        </ButtonLink>
      </Flex>
      <Grid
        templateAreas={`"position-details statistics"
                        "transaction-history transaction-history"`}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
        gridTemplateRows={{ base: "55% 1fr", xl: "45% 1fr" }}
        h="80vh"
        gap={4}
      >
        <PositionDetails gridArea="position-details" />
        <Statistics gridArea="statistics" />
        <TransactionHistory gridArea="transaction-history" />
      </Grid>
    </Flex>
  )
}
