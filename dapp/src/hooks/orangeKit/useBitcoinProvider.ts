import { useMemo } from "react"
import { OrangeKitBitcoinWalletProvider } from "@orangekit/react/dist/src/wallet/bitcoin-wallet-provider"
import { useConnector } from "./useConnector"

type UseBitcoinProviderReturn = OrangeKitBitcoinWalletProvider | undefined

export function useBitcoinProvider(): UseBitcoinProviderReturn {
  const connector = useConnector()

  return useMemo(() => {
    if (
      !connector ||
      !connector.getBitcoinProvider ||
      typeof connector.getBitcoinProvider !== "function"
    )
      return undefined

    return connector.getBitcoinProvider()
  }, [connector])
}
