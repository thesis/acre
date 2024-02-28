import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { RouterProvider } from "react-router-dom"
import { useInitializeAcreSdk } from "./hooks"
import theme from "./theme"
import {
  DocsDrawerContextProvider,
  LedgerWalletAPIProvider,
  SidebarContextProvider,
  WalletContextProvider,
} from "./contexts"
import { AcreSdkProvider } from "./acre-react/contexts"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import DocsDrawer from "./components/DocsDrawer"
import GlobalStyles from "./components/GlobalStyles"
import { router } from "./router"
import { useSentry } from "./hooks/sentry"

function DApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()

  return (
    <>
      <Header />
      <Box as="main">
        <RouterProvider router={router} />
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
