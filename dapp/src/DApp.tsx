import React, { useEffect, useState } from "react"
import { Center, Fade, Icon } from "@chakra-ui/react"
import { Provider as ReduxProvider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import { Config, WagmiProvider } from "wagmi"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
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
import getWagmiConfig from "./wagmiConfig"
import queryClient from "./queryClient"
import { delay, logPromiseFailure } from "./utils"
import { AcreLogo } from "./assets/icons"
import PostHogProvider from "./posthog/PostHogProvider"

function SplashPage() {
  return (
    <Center h="100vh" w="100vw">
      <Icon as={AcreLogo} w={200} h={300} />
    </Center>
  )
}

function DApp() {
  useInitApp()

  return (
    <>
      <GlobalStyles />
      <RouterProvider router={router} fallbackElement={<SplashPage />} />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

function DAppProviders() {
  const [config, setConfig] = useState<Config | undefined>()

  useEffect(() => {
    const setWagmiConfig = async () => {
      await delay(500)
      const wagmiConfig = await getWagmiConfig()
      setConfig(wagmiConfig)
    }

    logPromiseFailure(setWagmiConfig())
  }, [])

  if (!config)
    return (
      <Fade in={!config}>
        <SplashPage />
      </Fade>
    )

  return (
    <Fade in={config !== undefined}>
      <PostHogProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <AcreSdkProvider>
              <DocsDrawerContextProvider>
                <SidebarContextProvider>
                  <WalletConnectionErrorContextProvider>
                    <ReduxProvider store={store}>
                      <DApp />
                    </ReduxProvider>
                  </WalletConnectionErrorContextProvider>
                </SidebarContextProvider>
              </DocsDrawerContextProvider>
            </AcreSdkProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </PostHogProvider>
    </Fade>
  )
}

export default DAppProviders
