import React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { Provider as ReduxProvider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import { WagmiProvider } from "wagmi"
import { QueryClientProvider } from "@tanstack/react-query"
import { AcreSdkProvider } from "./acre-react/contexts"
import GlobalStyles from "./components/GlobalStyles"
import {
  DocsDrawerContextProvider,
  SidebarContextProvider,
  WalletConnectionErrorContextProvider,
} from "./contexts"
import { useInitApp } from "./hooks"
import { router } from "./router"
import { store } from "./store"
import theme from "./theme"
import wagmiConfig from "./wagmiConfig"
import queryClient from "./queryClient"

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
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AcreSdkProvider>
          <DocsDrawerContextProvider>
            <SidebarContextProvider>
              <WalletConnectionErrorContextProvider>
                <ReduxProvider store={store}>
                  <ChakraProvider theme={theme}>
                    <DApp />
                  </ChakraProvider>
                </ReduxProvider>
              </WalletConnectionErrorContextProvider>
            </SidebarContextProvider>
          </DocsDrawerContextProvider>
        </AcreSdkProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default DAppProviders
