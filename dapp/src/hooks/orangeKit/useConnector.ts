import { useMemo } from "react"
import { useAccount } from "wagmi"
import { orangeKit } from "#/utils"
import { OrangeKitConnector } from "#/types"
import useWalletAddress from "../store/useWalletAddress"

type UseConnectorReturn = OrangeKitConnector | undefined

export function useConnector(): UseConnectorReturn {
  const { connector } = useAccount()
  const address = useWalletAddress()

  return useMemo(() => {
    if (address && orangeKit.isOrangeKitConnector(connector))
      return orangeKit.typeConversionToOrangeKitConnector(connector)

    return undefined
  }, [connector, address])
}
