import { http, createConfig, CreateConnectorFn } from "wagmi"
import { Chain, mainnet, sepolia } from "wagmi/chains"
import {
  getOrangeKitUnisatConnector,
  getOrangeKitOKXConnector,
  getOrangeKitXverseConnector,
  getOrangeKitLedgerLiveConnector,
} from "@orangekit/react"
import { env } from "./constants"
import { router } from "./utils"
import { SEARCH_PARAMS_NAMES } from "./router/path"
import { LAST_USED_BTC_ADDRESS_KEY } from "./hooks/useLastUsedBtcAddress"

const isTestnet = env.USE_TESTNET
const CHAIN_ID = isTestnet ? sepolia.id : mainnet.id
const IsEmbed = router.getURLParam(SEARCH_PARAMS_NAMES.embed)
// TODO: Push address to connector
const lastUsedBtcAddress = localStorage.getItem(LAST_USED_BTC_ADDRESS_KEY)
// eslint-disable-next-line no-console
console.log("lastUsedBtcAddress=", lastUsedBtcAddress)

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
const orangeKitXverseConnector = getOrangeKitXverseConnector(connectorConfig)
const orangeKitLedgerLiveConnector =
  getOrangeKitLedgerLiveConnector(connectorConfig)

const embedConnectors = [orangeKitLedgerLiveConnector()]
const defaultConnectors = [
  orangeKitOKXConnector(),
  orangeKitUnisatConnector(),
  orangeKitXverseConnector(),
]

const connectors = [
  ...(IsEmbed
    ? // TODO: Use correct connector
      embedConnectors
    : defaultConnectors),
] as unknown as CreateConnectorFn[]

const wagmiConfig = createConfig({
  chains,
  multiInjectedProviderDiscovery: false,
  connectors,
  transports,
})

export default wagmiConfig
