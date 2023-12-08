import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import theme from "./theme"
import {
  DocsDrawerContextProvider,
  LedgerWalletAPIProvider,
  ModalContextProvider,
  SidebarContextProvider,
  WalletContextProvider,
} from "./contexts"
import Header from "./components/Header"
import Overview from "./components/Overview"
import Sidebar from "./components/Sidebar"
import DocsDrawer from "./components/DocsDrawer"
import ModalOverlay from "./components/ModalOverlay"

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
      {/* The user has several modals in a flow.
      Let's use our own modal overlay to prevent the background flickering effect. */}
      <ModalOverlay />
    </>
  )
}

function DAppProviders() {
  return (
    <LedgerWalletAPIProvider>
      <WalletContextProvider>
        <DocsDrawerContextProvider>
          <SidebarContextProvider>
            <ModalContextProvider>
              <ChakraProvider theme={theme}>
                <DApp />
              </ChakraProvider>
            </ModalContextProvider>
          </SidebarContextProvider>
        </DocsDrawerContextProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
