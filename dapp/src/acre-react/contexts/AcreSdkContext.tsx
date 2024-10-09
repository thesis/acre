import React, { useCallback, useMemo, useState } from "react"
import { Acre } from "@acre-btc/sdk"
import { BitcoinProvider } from "@acre-btc/sdk/dist/src/lib/bitcoin/providers"
import { BITCOIN_NETWORK, env } from "#/constants"

const { TBTC_API_ENDPOINT, SUBGRAPH_API_KEY } = env
const ETH_RPC_URL = env.ETH_HOSTNAME_HTTP
const GELATO_API_KEY = env.GELATO_RELAY_API_KEY

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
        SUBGRAPH_API_KEY,
      )

      if (bitcoinProvider) {
        setIsConnected(false)
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
