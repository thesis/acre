import {
  ConnectorConfig,
  createOrangeKitConnector,
} from "@orangekit/react/dist/src/wallet/connector"
import { BitcoinNetwork } from "@acre-btc/sdk"
import icon from "./icon"

import AcreLedgerLiveBitcoinProvider, {
  LedgerLiveWalletApiBitcoinProviderOptions,
} from "./bitcoin-provider"

export default function getOrangeKitLedgerLiveConnector({
  rpcUrl,
  chainId,
  relayApiKey,
  options,
}: ConnectorConfig & { options: LedgerLiveWalletApiBitcoinProviderOptions }) {
  const bitcoinWalletProvider = AcreLedgerLiveBitcoinProvider.init(
    chainId === 1 ? BitcoinNetwork.Mainnet : BitcoinNetwork.Testnet,
    options,
  )

  return () =>
    createOrangeKitConnector(
      "orangekit-ledger-live",
      "Ledger Live",
      icon,
      rpcUrl,
      chainId,
      bitcoinWalletProvider,
      relayApiKey,
    )
}
