import { http, createConfig, CreateConnectorFn } from "wagmi"
import { Chain, mainnet, sepolia } from "wagmi/chains"
import {
  getOrangeKitUnisatConnector,
  getOrangeKitOKXConnector,
} from "@orangekit/react"

const { VITE_ETH_HOSTNAME_HTTP, VITE_GELATO_RELAY_API_KEY, VITE_USE_TESTNET } =
  import.meta.env
const isTestnet = VITE_USE_TESTNET === "true"

const CHAIN_ID = isTestnet ? sepolia.id : mainnet.id

const chains: [Chain, ...Chain[]] = isTestnet ? [sepolia] : [mainnet]
const connectorConfig = {
  rpcUrl: VITE_ETH_HOSTNAME_HTTP,
  chainId: CHAIN_ID,
  relayApiKey: VITE_GELATO_RELAY_API_KEY,
}
const transports = chains.reduce(
  (acc, { id }) => ({ ...acc, [id]: http(VITE_ETH_HOSTNAME_HTTP) }),
  {},
)

const orangeKitUnisatConnector = getOrangeKitUnisatConnector(connectorConfig)
const orangeKitOKXConnector = getOrangeKitOKXConnector(connectorConfig)

const connectors = [
  orangeKitUnisatConnector(),
  orangeKitOKXConnector(),
] as unknown as CreateConnectorFn[]

const wagmiConfig = createConfig({
  chains,
  multiInjectedProviderDiscovery: false,
  connectors,
  transports,
})

export default wagmiConfig
