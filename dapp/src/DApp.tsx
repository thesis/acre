import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
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
import ActivityPage from "./components/ActivityDetails/ActivityPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Overview />,
  },
  {
    path: "activity-details",
    element: <ActivityPage />,
  },
])

function DApp() {
  useDetectThemeMode()
  useSentry()

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
        <DocsDrawerContextProvider>
          <SidebarContextProvider>
            <ChakraProvider theme={theme}>
              <GlobalStyles />
              <DApp />
            </ChakraProvider>
          </SidebarContextProvider>
        </DocsDrawerContextProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
