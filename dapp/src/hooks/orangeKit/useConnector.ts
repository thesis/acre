import { useMemo } from "react"
import { useAccount } from "wagmi"
import { orangeKit } from "#/utils"
import { OrangeKitConnector } from "#/types"

type UseConnectorReturn = OrangeKitConnector | undefined

export function useConnector(): UseConnectorReturn {
  const { connector, status } = useAccount()

  return useMemo(() => {
    if (
      orangeKit.isOrangeKitConnector(connector) &&
      orangeKit.isConnectedStatus(status)
    )
      return orangeKit.typeConversionToOrangeKitConnector(connector)

    return undefined
  }, [connector, status])
}
