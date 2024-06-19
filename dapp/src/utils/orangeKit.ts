import { Connector } from "wagmi"

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

export default {
  isOrangeKitConnector,
  isConnectedStatus,
}
