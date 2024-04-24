import {
  Account,
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import {
  TypedDataEncoder,
  Provider,
  Signer,
  TransactionRequest,
  TypedDataDomain,
  TypedDataField,
  TransactionResponse,
} from "ethers"
import { CURRENCY_ID_BITCOIN } from "#/constants"
import { EthereumSignerCompatibleWithEthersV5 } from "@acre-btc/sdk"
import {
  getLedgerWalletAPITransport as getDappLedgerWalletAPITransport,
  getLedgerLiveProvider,
  serializeLedgerWalletApiEthereumTransaction,
} from "./utils"

// Created based on the
// https://github.com/keep-network/tbtc-v2/blob/main/typescript/src/lib/utils/ledger.ts
// but with support for ethers v6.
class LedgerLiveEthereumSigner extends EthereumSignerCompatibleWithEthersV5 {
  readonly #transport: WindowMessageTransport

  readonly #client: WalletAPIClient

  readonly #bitcoinAccount: Account

  static async fromAddress(
    bitcoinAddress: string,
    getLedgerWalletAPITransport: () => WindowMessageTransport = getDappLedgerWalletAPITransport,
  ) {
    const dappTransport = getLedgerWalletAPITransport()

    dappTransport.connect()

    const client = new WalletAPIClient(dappTransport)

    const accountsList = await client.account.list({
      currencyIds: [CURRENCY_ID_BITCOIN],
    })

    dappTransport.disconnect()

    const account = accountsList.find((acc) => acc.address === bitcoinAddress)

    if (!account) throw new Error("Bitcoin Account not found")

    return new LedgerLiveEthereumSigner(
      dappTransport,
      client,
      account,
      getLedgerLiveProvider(),
    )
  }

  private constructor(
    transport: WindowMessageTransport,
    walletApiClient: WalletAPIClient,
    account: Account,
    provider: Provider | null,
  ) {
    super(provider)
    this.#bitcoinAccount = account
    this.#transport = transport
    this.#client = walletApiClient
  }

  // eslint-disable-next-line class-methods-use-this
  getAddress(): Promise<string> {
    // TODO: We should return the Ethereum address created based on the Bitcoin
    // address. We probably will use the Signer from OrangeKit once it is
    // implemented. For now, the `Signer.getAddress` is not used anywhere in the
    // Acre SDK, only during the tBTC-v2.ts SDK initialization, so we can set
    // random ethereum account.
    return Promise.resolve("0x7b570B83D53e0671271DCa2CDf3429E9C4CAb12E")
  }

  async #clientRequest<T>(callback: () => Promise<T>) {
    try {
      this.#transport.connect()
      return await callback()
    } finally {
      this.#transport.disconnect()
    }
  }

  connect(provider: Provider | null): Signer {
    return new LedgerLiveEthereumSigner(
      this.#transport,
      this.#client,
      this.#bitcoinAccount,
      provider,
    )
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    const ethereumTransaction =
      serializeLedgerWalletApiEthereumTransaction(transaction)

    const buffer = await this.#clientRequest<Buffer>(() =>
      this.#client.transaction.sign(
        this.#bitcoinAccount.id,
        ethereumTransaction,
      ),
    )

    return buffer.toString()
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const populatedTransaction = await this.populateTransaction(tx)

    const ethereumTransaction =
      serializeLedgerWalletApiEthereumTransaction(populatedTransaction)

    const transactionHash = await this.#clientRequest<string>(() =>
      this.#client.transaction.signAndBroadcast(
        this.#bitcoinAccount.id,
        ethereumTransaction,
      ),
    )

    const transactionResponse =
      await this.provider?.getTransaction(transactionHash)

    if (!transactionResponse) {
      throw new Error("Transaction response not found!")
    }

    return transactionResponse
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const buffer = await this.#clientRequest<Buffer>(() =>
      this.#client.message.sign(
        this.#bitcoinAccount.id,
        Buffer.from(message.toString()),
      ),
    )

    return buffer.toString("hex")
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: Record<string, any>,
  ): Promise<string> {
    const payload = TypedDataEncoder.getPayload(
      domain,
      types,
      value,
    ) as unknown as object

    return this.signMessage(JSON.stringify(payload))
  }
}

export { LedgerLiveEthereumSigner }
