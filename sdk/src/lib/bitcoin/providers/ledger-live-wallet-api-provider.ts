import {
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { addressFromExtPubKey } from "@swan-bitcoin/xpub-lib"
import { BitcoinProvider } from "./provider"

type Network = "mainnet" | "testnet"

/**
 * Ledger Live Wallet API Bitcoin Provider.
 */
export default class LedgerLiveWalletApiBitcoinProvider
  implements BitcoinProvider
{
  readonly #walletApiClient: WalletAPIClient

  readonly #windowMessageTransport: WindowMessageTransport

  readonly #accountId: string

  readonly #network: Network

  static async init(accountId: string, network: Network) {
    const windowMessageTransport = new WindowMessageTransport()
    windowMessageTransport.connect()

    const walletApiClient = new WalletAPIClient(windowMessageTransport)

    const currency = network === "mainnet" ? "bitcoin" : "bitcoin_testnet"

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

  /**
   * In the Ledger Live Wallet API the address is "renewed" each time funds are
   * received in order to allow some privacy. But to get the same depositor
   * owner Ethereum address we must always get the same Bitcoin address so we
   * must rely on the extended public key.
   *
   * @returns Always the same bitcoin address based on the extended public key
   *          (an address under the `m/purpose'/0'/accountId'/0/0` derivation
   *          path) even the address has been "renewed" by the Ledger Live
   *          Wallet API.
   */
  async getAddress(): Promise<string> {
    const xpub = await this.#walletApiClient.bitcoin.getXPub(this.#accountId)

    const { address } = addressFromExtPubKey({
      extPubKey: xpub,
      network: this.#network,
    })

    return address
  }
}
