import React, { useCallback, useContext, useMemo, useState } from "react"
import { Acre, EthereumNetwork } from "@acre/sdk"
import { LedgerLiveEthereumSigner } from "../web3"

type AcreSdkContextValue = {
  acre?: Acre
  init: (ethereumAddress: string, network: EthereumNetwork) => Promise<void>
  isInitialized: boolean
}

const AcreSdkContext = React.createContext<AcreSdkContextValue>({
  acre: undefined,
  init: async () => {},
  isInitialized: false,
})

type Props = {
  children: React.ReactNode
}

function AcreSdkProvider({ children }: Props) {
  const [acre, setAcre] = useState<Acre | undefined>(undefined)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const init = useCallback<AcreSdkContextValue["init"]>(
    async (ethereumAddress: string, network: EthereumNetwork) => {
      if (!ethereumAddress) throw new Error("Ethereum address not defined")

      const sdk = await Acre.initializeEthereum(
        await LedgerLiveEthereumSigner.fromAddress(ethereumAddress),
        network,
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

export function useAcreContext() {
  return useContext(AcreSdkContext)
}

export default AcreSdkProvider
