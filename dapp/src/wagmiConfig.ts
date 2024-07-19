import { http, createConfig, CreateConnectorFn } from "wagmi"
import { Chain, mainnet, sepolia } from "wagmi/chains"
import {
  getOrangeKitUnisatConnector,
  getOrangeKitOKXConnector,
  getOrangeKitXVerseConnector,
} from "@orangekit/react"
import { env } from "./constants"

const isTestnet = env.USE_TESTNET
const CHAIN_ID = isTestnet ? sepolia.id : mainnet.id

const chains: [Chain, ...Chain[]] = isTestnet ? [sepolia] : [mainnet]
const connectorConfig = {
  rpcUrl: env.ETH_HOSTNAME_HTTP,
  chainId: CHAIN_ID,
  relayApiKey: env.GELATO_RELAY_API_KEY,
}
const transports = chains.reduce(
  (acc, { id }) => ({ ...acc, [id]: http(env.ETH_HOSTNAME_HTTP) }),
  {},
)

const orangeKitUnisatConnector = getOrangeKitUnisatConnector(connectorConfig)
const orangeKitOKXConnector = getOrangeKitOKXConnector(connectorConfig)
const orangeKitXVerseConnector = getOrangeKitXVerseConnector(connectorConfig)

const connectors = [
  orangeKitOKXConnector(),
  orangeKitUnisatConnector(),
  orangeKitXVerseConnector(),
] as unknown as CreateConnectorFn[]

const wagmiConfig = createConfig({
  chains,
  multiInjectedProviderDiscovery: false,
  connectors,
  transports,
})

export default wagmiConfig
