import { BitcoinProvider } from "@acre-btc/sdk"
import { useMemo } from "react"
import { useConnector } from "./useConnector"

type UseBitcoinProviderReturn = BitcoinProvider | undefined

export function useBitcoinProvider(): UseBitcoinProviderReturn {
  const connector = useConnector()

  // TODO: Temporary solution - Use provider form connector
  return useMemo(() => {
    if (!connector) return undefined

    return { getAddress: connector.getBitcoinAddress }
  }, [connector])
}
