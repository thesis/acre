import { http, createConfig, CreateConnectorFn } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import {
  getOrangeKitUnisatConnector,
  getOrangeKitOKXConnector,
} from "@orangekit/react"

const { VITE_ETH_HOSTNAME_HTTP, VITE_GELATO_RELAY_API_KEY, VITE_USE_TESTNET } =
  import.meta.env
const CHAIN_ID = VITE_USE_TESTNET === "true" ? sepolia.id : mainnet.id

const connectorConfig = {
  rpcUrl: VITE_ETH_HOSTNAME_HTTP,
  chainId: CHAIN_ID,
  relayApiKey: VITE_GELATO_RELAY_API_KEY,
}

const orangeKitUnisatConnector = getOrangeKitUnisatConnector(connectorConfig)
const orangeKitOKXConnector = getOrangeKitOKXConnector(connectorConfig)

const connectors = [
  orangeKitUnisatConnector(),
  orangeKitOKXConnector(),
] as unknown as CreateConnectorFn[]

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  multiInjectedProviderDiscovery: false,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export default wagmiConfig
