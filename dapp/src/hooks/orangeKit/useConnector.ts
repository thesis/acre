import { useMemo } from "react"
import { useAccount } from "wagmi"
import { CreateOrangeKitConnectorFn } from "@orangekit/react/dist/src/wallet/connector"

type OrangeKitConnector = ReturnType<CreateOrangeKitConnectorFn>

type UseConnectorReturn = OrangeKitConnector | undefined

export function useConnector(): UseConnectorReturn {
  const { connector, status } = useAccount()

  return useMemo(() => {
    if (connector?.type === "orangekit" && status === "connected")
      return connector as unknown as OrangeKitConnector

    return undefined
  }, [connector, status])
}
