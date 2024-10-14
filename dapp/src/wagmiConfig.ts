import { http, createConfig, CreateConnectorFn } from "wagmi"
import { Chain, mainnet, sepolia } from "wagmi/chains"
import {
  getOrangeKitUnisatConnector,
  getOrangeKitOKXConnector,
  getOrangeKitXverseConnector,
  getOrangeKitLedgerLiveConnector,
} from "@orangekit/react"
import { CreateOrangeKitConnectorFn } from "@orangekit/react/dist/src/wallet/connector"
import { env } from "./constants"
import { getLastUsedBtcAddress } from "./hooks/useLastUsedBtcAddress"
import referralProgram, { EmbedApp } from "./utils/referralProgram"

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
const orangeKitXverseConnector = getOrangeKitXverseConnector(connectorConfig)
const orangeKitLedgerLiveConnector = getOrangeKitLedgerLiveConnector({
  ...connectorConfig,
  options: {
    tryConnectToAddress: getLastUsedBtcAddress(),
  },
})

const embedConnectorsMap: Record<EmbedApp, () => CreateOrangeKitConnectorFn> = {
  "ledger-live": orangeKitLedgerLiveConnector,
}

const defaultConnectors = [
  orangeKitOKXConnector(),
  orangeKitUnisatConnector(),
  orangeKitXverseConnector(),
]

const embeddedApp = referralProgram.getEmbeddedApp()
const connectors = (embeddedApp !== undefined
  ? [embedConnectorsMap[embeddedApp]()]
  : defaultConnectors) as unknown as CreateConnectorFn[]

const wagmiConfig = createConfig({
  chains,
  multiInjectedProviderDiscovery: false,
  connectors,
  transports,
})

export default wagmiConfig
