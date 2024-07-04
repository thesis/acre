import React, { useCallback, useMemo, useState } from "react"
import { Acre } from "@acre-btc/sdk"
import { BitcoinProvider } from "@acre-btc/sdk/dist/src/lib/bitcoin/providers"
import { BITCOIN_NETWORK } from "#/constants"

const TBTC_API_ENDPOINT = import.meta.env.VITE_TBTC_API_ENDPOINT
const ETH_RPC_URL = import.meta.env.VITE_ETH_HOSTNAME_HTTP
const GELATO_API_KEY = import.meta.env.VITE_GELATO_RELAY_API_KEY

type AcreSdkContextValue = {
  acre?: Acre
  init: (bitcoinProvider?: BitcoinProvider) => Promise<void>
  isInitialized: boolean
  isConnected: boolean
}

export const AcreSdkContext = React.createContext<AcreSdkContextValue>({
  acre: undefined,
  init: async () => {},
  isInitialized: false,
  isConnected: false,
})

export function AcreSdkProvider({ children }: { children: React.ReactNode }) {
  const [acre, setAcre] = useState<Acre>()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const init = useCallback<AcreSdkContextValue["init"]>(
    async (bitcoinProvider?: BitcoinProvider) => {
      let sdk = await Acre.initialize(
        BITCOIN_NETWORK,
        TBTC_API_ENDPOINT,
        ETH_RPC_URL,
        GELATO_API_KEY,
      )

      if (bitcoinProvider) {
        sdk = await sdk.connect(bitcoinProvider)
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }

      setAcre(sdk)
      setIsInitialized(true)
    },
    [],
  )

  const context = useMemo(
    () => ({
      acre,
      init,
      isInitialized,
      isConnected,
    }),
    [init, acre, isInitialized, isConnected],
  )

  return (
    <AcreSdkContext.Provider value={context}>
      {children}
    </AcreSdkContext.Provider>
  )
}
