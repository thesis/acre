import React, { useCallback, useMemo, useState } from "react"
import { Acre } from "@acre-btc/sdk"
import { BitcoinProvider } from "@acre-btc/sdk/dist/src/lib/bitcoin/providers"
import { BITCOIN_NETWORK } from "#/constants"

const TBTC_API_ENDPOINT = import.meta.env.VITE_TBTC_API_ENDPOINT
const ETH_RPC_URL = import.meta.env.VITE_ETH_HOSTNAME_HTTP

type AcreSdkContextValue = {
  acre?: Acre
  init: (bitcoinProvider: BitcoinProvider) => Promise<void>
  isInitialized: boolean
}

export const AcreSdkContext = React.createContext<AcreSdkContextValue>({
  acre: undefined,
  init: async () => {},
  isInitialized: false,
})

export function AcreSdkProvider({ children }: { children: React.ReactNode }) {
  const [acre, setAcre] = useState<Acre | undefined>(undefined)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const init = useCallback<AcreSdkContextValue["init"]>(
    async (bitcoinProvider: BitcoinProvider) => {
      const sdk: Acre = await Acre.initialize(
        BITCOIN_NETWORK,
        bitcoinProvider,
        TBTC_API_ENDPOINT,
        ETH_RPC_URL,
      )

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
    }),
    [init, acre, isInitialized],
  )

  return (
    <AcreSdkContext.Provider value={context}>
      {children}
    </AcreSdkContext.Provider>
  )
}
