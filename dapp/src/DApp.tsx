import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import theme from "./theme"
import {
  DocsDrawerContextProvider,
  LedgerWalletAPIProvider,
  SidebarContextProvider,
  WalletContextProvider,
} from "./contexts"
import Header from "./components/Header"
import Overview from "./components/Overview"
import Sidebar from "./components/Sidebar"
import DocsDrawer from "./components/DocsDrawer"

function DApp() {
  useDetectThemeMode()

  return (
    <>
      <Header />
      <Box as="main">
        <Overview />
      </Box>
      <Sidebar />
      <DocsDrawer />
    </>
  )
}

function DAppProviders() {
  return (
    <LedgerWalletAPIProvider>
      <WalletContextProvider>
        <DocsDrawerContextProvider>
          <SidebarContextProvider>
            <ChakraProvider theme={theme}>
              <DApp />
            </ChakraProvider>
          </SidebarContextProvider>
        </DocsDrawerContextProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
