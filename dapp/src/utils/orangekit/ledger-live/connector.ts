import {
  ConnectorConfig,
  createOrangeKitConnector,
} from "@orangekit/react/dist/src/wallet/connector"
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
  const bitcoinWalletProvider = new AcreLedgerLiveBitcoinProvider(
    chainId === 1 ? "mainnet" : "testnet",
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
