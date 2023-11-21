import React from "react"
import { ChakraProvider, Box } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import { LedgerWalletAPIProvider } from "./providers"
import theme from "./theme"
import { LedgerLiveAppProvider } from "./contexts/LedgerLiveAppContext"
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
      <LedgerLiveAppProvider>
        <ChakraProvider theme={theme}>
          <DApp />
        </ChakraProvider>
      </LedgerLiveAppProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
