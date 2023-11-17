import React, { useContext } from "react"
import { ChakraProvider, Box, Text } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import { LedgerWalletAPIProvider } from "./providers"
import theme from "./theme"
import {
  LedgerLiveAppContext,
  LedgerLiveAppProvider,
} from "./contexts/LedgerLiveAppContext"
import Navbar from "./components/Navbar"

function DApp() {
  useDetectThemeMode()

  const { btcAccount, ethAccount } = useContext(LedgerLiveAppContext)

  return (
    <Box>
      <Navbar />
      <h1>Ledger live - Acre dApp</h1>
      {btcAccount && <Text>Account: {btcAccount.address}</Text>}
      {ethAccount && <Text>Account: {ethAccount.address}</Text>}
    </Box>
  )
}

function DAppProviders() {
  return (
    <LedgerWalletAPIProvider>
      <LedgerLiveAppProvider>
        <ChakraProvider theme={theme}>
          <DApp />
        </ChakraProvider>
      </LedgerLiveAppProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
