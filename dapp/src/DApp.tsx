import React from "react"
import { ChakraProvider, Button, Box } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import { LedgerWalletAPIProvider } from "./providers"
import { getThemeConfig } from "./theme/utils/utils"
import theme from "./theme/index"

function DApp() {
  return (
    <Box p={4}>
      <h1>Ledger live - Acre dApp</h1>
      <Button>Test button</Button>
    </Box>
  )
}

function DAppProviders() {
  const themeMode = useDetectThemeMode()

  return (
    <LedgerWalletAPIProvider>
      <ChakraProvider
        theme={{
          ...theme,
          config: getThemeConfig(themeMode),
        }}
      >
        <DApp />
      </ChakraProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders