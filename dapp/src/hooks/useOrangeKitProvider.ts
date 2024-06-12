import { BitcoinProvider } from "@acre-btc/sdk"
import { useMemo } from "react"
import { useOrangeKitConnector } from "./useOrangeKitConnector"

type UseOrangeKitProviderReturn = BitcoinProvider | undefined

export function useOrangeKitProvider(): UseOrangeKitProviderReturn {
  const connector = useOrangeKitConnector()

  // TODO: Temporary solution - Use provider form connector
  return useMemo(() => {
    if (!connector) return undefined

    return { getAddress: connector.getBitcoinAddress }
  }, [connector])
}
