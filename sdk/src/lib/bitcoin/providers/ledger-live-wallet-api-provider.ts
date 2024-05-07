import {
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { addressFromExtPubKey } from "@swan-bitcoin/xpub-lib"
import { BitcoinProvider } from "./provider"
import { BitcoinNetwork } from "../network"

type Network = Exclude<BitcoinNetwork, BitcoinNetwork.Unknown>

class LedgerLiveWalletApiBitcoinProvider implements BitcoinProvider {
  readonly #walletApiClient: WalletAPIClient

  readonly #windowMessageTransport: WindowMessageTransport

  readonly #accountId: string

  readonly #network: Network

  static async init(accountId: string, network: Network) {
    const windowMessageTransport = new WindowMessageTransport()
    windowMessageTransport.connect()

    const walletApiClient = new WalletAPIClient(windowMessageTransport)

    const currency =
      network === BitcoinNetwork.Mainnet ? "bitcoin" : "bitcoin_testnet"

    const accounts = await walletApiClient.account.list({
      currencyIds: [currency],
    })

    const account = accounts.find((acc) => acc.id === accountId)

    if (!account) throw new Error("Account not found")

    return new LedgerLiveWalletApiBitcoinProvider(
      accountId,
      windowMessageTransport,
      walletApiClient,
      network,
    )
  }

  private constructor(
    _accountId: string,
    _windowMessageTransport: WindowMessageTransport,
    _walletApiClient: WalletAPIClient,
    _network: Network,
  ) {
    this.#windowMessageTransport = _windowMessageTransport
    this.#walletApiClient = _walletApiClient
    this.#accountId = _accountId
    this.#network = _network
  }

  async getAddress(): Promise<string> {
    const xpub = await this.#walletApiClient.bitcoin.getXPub(this.#accountId)

    const { address } = addressFromExtPubKey({
      extPubKey: xpub,
      network: this.#network,
    })

    return address
  }
}

// eslint-disable-next-line import/prefer-default-export
export { LedgerLiveWalletApiBitcoinProvider }
