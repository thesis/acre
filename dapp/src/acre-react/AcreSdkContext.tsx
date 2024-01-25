import React, { useCallback, useContext, useMemo, useState } from "react"
import Acre from "sdk"
import { LedgerWalletSigner } from "../web3"

type AcreSdkContextType = {
  acre: Acre | undefined
  init: (ethereumAddress: string) => Promise<void>
  isInitialized: boolean
}

const AcreSdkContext = React.createContext<AcreSdkContextType>({
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

  const init = useCallback<AcreSdkContextType["init"]>(
    async (ethereumAddress: string) => {
      if (!ethereumAddress) throw new Error("Ethereum address not defined")

      const sdk = await Acre.initializeEthereum(
        await LedgerWalletSigner.fromAddress(ethereumAddress),
        "goerli",
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
