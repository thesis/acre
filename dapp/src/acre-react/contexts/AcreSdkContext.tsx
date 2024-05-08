import React, { useCallback, useMemo, useState } from "react"
import { Acre, EthereumNetwork } from "@acre-btc/sdk"
import { BitcoinProvider } from "@acre-btc/sdk/dist/src/lib/bitcoin/providers"

const TBTC_API_ENDPOINT = import.meta.env.VITE_TBTC_API_ENDPOINT

type AcreSdkContextValue = {
  acre?: Acre
  init: (
    bitcoinProvider: BitcoinProvider,
    network: EthereumNetwork,
  ) => Promise<void>
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
    async (bitcoinProvider: BitcoinProvider, network: EthereumNetwork) => {
      const sdk = await Acre.initializeEthereum(
        bitcoinProvider,
        network,
        TBTC_API_ENDPOINT,
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
