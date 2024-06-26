import { orangeKit } from "#/utils"
import { OrangeKitConnector } from "#/types"
import { useConnectors as useWagmiConnectors } from "wagmi"

const { isOrangeKitConnector, typeConversionToOrangeKitConnector } = orangeKit

export function useConnectors() {
  const connectors = useWagmiConnectors()

  return connectors.reduce<OrangeKitConnector[]>((acc, connector) => {
    if (isOrangeKitConnector(connector)) {
      acc.push(typeConversionToOrangeKitConnector(connector))
    }
    return acc
  }, [])
}
