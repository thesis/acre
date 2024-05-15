import {
  Account,
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { addressFromExtPubKey, Purpose } from "@swan-bitcoin/xpub-lib"
import { BitcoinAddressHelper } from "@orangekit/sdk"
import { BitcoinProvider } from "./provider"

type Network = "mainnet" | "testnet"

/**
 * Ledger Live Wallet API Bitcoin Provider.
 */
export default class LedgerLiveWalletApiBitcoinProvider
  implements BitcoinProvider
{
  readonly #walletApiClient: WalletAPIClient

  // TODO: Currently this variable is not used but we should probably close the
  // connection once the operation is finished. We will handle it in a separate
  // PR.
  readonly #windowMessageTransport: WindowMessageTransport

  readonly #account: Account

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
      account,
      windowMessageTransport,
      walletApiClient,
      network,
    )
  }

  private constructor(
    account: Account,
    windowMessageTransport: WindowMessageTransport,
    walletApiClient: WalletAPIClient,
    network: Network,
  ) {
    this.#windowMessageTransport = windowMessageTransport
    this.#walletApiClient = walletApiClient
    this.#account = account
    this.#network = network
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
    const bitcoinAddress = this.#account.address
    let purpose: Purpose | undefined

    if (BitcoinAddressHelper.isP2PKHAddress(bitcoinAddress)) {
      purpose = Purpose.P2PKH
    } else if (BitcoinAddressHelper.isP2WPKHAddress(bitcoinAddress)) {
      purpose = Purpose.P2WPKH
    } else {
      throw new Error("Unsupported Bitcoin address type")
    }

    const xpub = await this.#walletApiClient.bitcoin.getXPub(this.#account.id)

    const { address } = addressFromExtPubKey({
      extPubKey: xpub,
      change: 0,
      keyIndex: 0,
      purpose,
      network: this.#network,
    })

    return address
  }
}
