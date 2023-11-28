import React from "react"
import { ChakraProvider, Box } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import theme from "./theme"
import { LedgerWalletAPIProvider, WalletContextProvider } from "./contexts"
import Navbar from "./components/Navbar"
import Overview from "./components/Overview"

function DApp() {
  useDetectThemeMode()

  return (
    <Box height="100%" p={6}>
      <Navbar />
      <Overview />
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
