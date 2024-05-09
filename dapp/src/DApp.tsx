import React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { Provider as ReduxProvider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import { AcreSdkProvider } from "./acre-react/contexts"
import GlobalStyles from "./components/GlobalStyles"
import {
  DocsDrawerContextProvider,
  LedgerWalletAPIProvider,
  SidebarContextProvider,
  WalletContextProvider,
} from "./contexts"
import { useInitApp } from "./hooks"
import { router } from "./router"
import { store } from "./store"
import theme from "./theme"

function DApp() {
  useInitApp()

  return (
    <>
      <GlobalStyles />
      <RouterProvider router={router} />
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
