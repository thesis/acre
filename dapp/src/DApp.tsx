import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { useDetectThemeMode, useSentry } from "./hooks"
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
import GlobalStyles from "./components/GlobalStyles"
import AcreSdkProvider from "./contexts/AcreSdkContext"

function DApp() {
  useDetectThemeMode()
  useSentry()

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
        <AcreSdkProvider>
          <DocsDrawerContextProvider>
            <SidebarContextProvider>
              <ChakraProvider theme={theme}>
                <GlobalStyles />
                <DApp />
              </ChakraProvider>
            </SidebarContextProvider>
          </DocsDrawerContextProvider>
        </AcreSdkProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
