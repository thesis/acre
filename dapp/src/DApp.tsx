import React, { useEffect } from "react"
import { Box, ChakraProvider } from "@chakra-ui/react"
import { Provider as ReduxProvider } from "react-redux"
import { useSentry } from "./hooks"
import { store } from "./redux/store"
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
import { fetchBTCPriceUSD } from "./redux/thunks"
import { useAppDispatch } from "./hooks"

function DApp() {
  const dispatch = useAppDispatch()
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()

  useEffect(() => {
    dispatch(fetchBTCPriceUSD())
  }, [dispatch])

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
            <ReduxProvider store={store}>
              <ChakraProvider theme={theme}>
                <GlobalStyles />
                <DApp />
              </ChakraProvider>
            </ReduxProvider>
          </SidebarContextProvider>
        </DocsDrawerContextProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
