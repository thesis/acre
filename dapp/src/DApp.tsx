import React from "react"
import { ChakraProvider, Flex } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import theme from "./theme"
import { LedgerWalletAPIProvider, WalletContextProvider } from "./contexts"
import Navbar from "./components/Navbar"
import Overview from "./components/Overview"

function DApp() {
  useDetectThemeMode()

  return (
    <Flex p={6} gap={2} direction="column">
      <Navbar />
      <Overview />
    </Flex>
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
