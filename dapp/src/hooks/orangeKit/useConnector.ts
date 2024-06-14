import { WithRequired } from "#/types"
import { useMemo } from "react"
import { Connector, useAccount } from "wagmi"
import { OrangeKitBitcoinWalletProvider } from "@orangekit/react/dist/src/wallet/bitcoin-wallet-provider"

// TODO: We need to export the OrangeKitWagmiConnector type.
type OrangeKitWagmiConnector = WithRequired<Connector, "getClient"> & {
  getBitcoinAddress: () => Promise<string>
  getBitcoinProvider: () => OrangeKitBitcoinWalletProvider
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
