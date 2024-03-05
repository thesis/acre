import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { Provider as ReduxProvider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import { useInitApp } from "./hooks"
import { store } from "./store"
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

function DApp() {
  useInitApp()

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
              <ReduxProvider store={store}>
                <ChakraProvider theme={theme}>
                  <GlobalStyles />
                  <DApp />
                </ChakraProvider>
              </ReduxProvider>
            </SidebarContextProvider>
          </DocsDrawerContextProvider>
        </AcreSdkProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
