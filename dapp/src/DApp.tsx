import React from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { useSentry } from "./hooks"
import theme from "./theme"
import {
  DocsDrawerContextProvider,
  LedgerWalletAPIProvider,
  SidebarContextProvider,
  WalletContextProvider,
} from "./contexts"
import Header from "./components/Header"
import OverviewPage from "./pages/Overview"
import Sidebar from "./components/Sidebar"
import DocsDrawer from "./components/DocsDrawer"
import GlobalStyles from "./components/GlobalStyles"
import ActivityPage from "./pages/ActivityDetails/ActivityPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <OverviewPage />,
  },
  {
    path: "activity-details",
    element: <ActivityPage />,
  },
])

function DApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
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
