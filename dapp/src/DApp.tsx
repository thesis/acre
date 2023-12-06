import React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { useDetectThemeMode } from "./hooks"
import theme from "./theme"
import {
  LedgerWalletAPIProvider,
  StakingFlowProvider,
  WalletContextProvider,
  DocsDrawerContextProvider,
} from "./contexts"
import Header from "./components/Header"
import Overview from "./components/Overview"

function DApp() {
  useDetectThemeMode()

  return (
    <>
      <Header />
      <main>
        <Overview />
      </main>
    </>
  )
}

function DAppProviders() {
  return (
    <LedgerWalletAPIProvider>
      <WalletContextProvider>
        <StakingFlowProvider>
          <DocsDrawerContextProvider>
            <ChakraProvider theme={theme}>
              <DApp />
            </ChakraProvider>
          </DocsDrawerContextProvider>
        </StakingFlowProvider>
      </WalletContextProvider>
    </LedgerWalletAPIProvider>
  )
}

export default DAppProviders
