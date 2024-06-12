import { WithRequired } from "#/types"
import { Connector, useAccount } from "wagmi"

// TODO: We need to export the OrangeKitWagmiConnector type.
type OrangeKitWagmiConnector = WithRequired<Connector, "getClient"> & {
  getBitcoinAddress: () => Promise<string>
}
type UseOrangeKitConnectorReturn = OrangeKitWagmiConnector | undefined

export function useOrangeKitConnector(): UseOrangeKitConnectorReturn {
  const { connector } = useAccount()
  if (connector?.type === "orangekit")
    return connector as OrangeKitWagmiConnector

  return undefined
}
