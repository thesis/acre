import { WithRequired } from "#/types"
import { useMemo } from "react"
import { Connector, useAccount } from "wagmi"

// TODO: We need to export the OrangeKitWagmiConnector type.
type OrangeKitWagmiConnector = WithRequired<Connector, "getClient"> & {
  getBitcoinAddress: () => Promise<string>
}
type UseConnectorReturn = OrangeKitWagmiConnector | undefined

export function useConnector(): UseConnectorReturn {
  const { connector } = useAccount()

  return useMemo(() => {
    if (connector?.type === "orangekit")
      return connector as OrangeKitWagmiConnector

    return undefined
  }, [connector])
}
