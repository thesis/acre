import React from "react"
import { ChakraProvider, Box, Text } from "@chakra-ui/react"
import { useDetectThemeMode, useWalletContext } from "./hooks"
import theme from "./theme"
import { LedgerWalletAPIProvider, WalletContextProvider } from "./contexts"
import Navbar from "./components/Navbar"

function DApp() {
  useDetectThemeMode()

  const { btcAccount, ethAccount } = useWalletContext()

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
      <WalletContextProvider>
        <ChakraProvider theme={theme}>
          <DApp />
        </ChakraProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
