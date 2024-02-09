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
import { CURRENCY_ID_ETHEREUM } from "#/constants"
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

  readonly #account: Account

  static async fromAddress(
    address: string,
    getLedgerWalletAPITransport: () => WindowMessageTransport = getDappLedgerWalletAPITransport,
  ) {
    const dappTransport = getLedgerWalletAPITransport()

    dappTransport.connect()

    const client = new WalletAPIClient(dappTransport)

    const accountsList = await client.account.list({
      currencyIds: [CURRENCY_ID_ETHEREUM],
    })

    dappTransport.disconnect()

    const account = accountsList.find((acc) => acc.address === address)

    if (!account) throw new Error("Account not found")

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
    this.#account = account
    this.#transport = transport
    this.#client = walletApiClient
  }

  getAddress(): Promise<string> {
    return Promise.resolve(this.#account.address)
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
      this.#account,
      provider,
    )
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    const ethereumTransaction =
      serializeLedgerWalletApiEthereumTransaction(transaction)

    const buffer = await this.#clientRequest<Buffer>(() =>
      this.#client.transaction.sign(this.#account.id, ethereumTransaction),
    )

    return buffer.toString()
  }

  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const populatedTransaction = await this.populateTransaction(tx)

    const ethereumTransaction =
      serializeLedgerWalletApiEthereumTransaction(populatedTransaction)

    const transactionHash = await this.#clientRequest<string>(() =>
      this.#client.transaction.signAndBroadcast(
        this.#account.id,
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
        this.#account.id,
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
