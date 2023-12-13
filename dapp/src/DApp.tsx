import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import theme from "./theme"
import { LedgerWalletAPIProvider, WalletContextProvider } from "./contexts"
import Header from "./components/Header"
import Overview from "./components/Overview"
import GlobalStyles from "./components/GlobalStyles"

function DApp() {
  useDetectThemeMode()

  return (
    <>
      <Header />
      <Box as="main">
        <Overview />
      </Box>
    </>
  )
}

function DAppProviders() {
  return (
    <LedgerWalletAPIProvider>
      <WalletContextProvider>
        <ChakraProvider theme={theme}>
          <GlobalStyles />
          <DApp />
        </ChakraProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
