import React from "react"
import { ChakraProvider, Button, Box } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import { LedgerWalletAPIProvider } from "./providers"
import theme from "./theme"

function DApp() {
  useDetectThemeMode()
  return (
    <Box p={4}>
      <h1>Ledger live - Acre dApp</h1>
      <Button>Test button</Button>
    </Box>
  )
}

function DAppProviders() {
  return (
    <LedgerWalletAPIProvider>
      <ChakraProvider theme={theme}>
        <DApp />
      </ChakraProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
