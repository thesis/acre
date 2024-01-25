import {
  Account,
  EthereumTransaction,
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
  ZeroAddress,
  TransactionResponse,
  JsonRpcProvider,
} from "ethers"
import { EthereumSignerCompatibleWithEthersV5, Hex } from "sdk/src/lib/utils"
import { CURRENCY_ID_ETHEREUM } from "#/constants"
import { getLedgerWalletAPITransport as getDappLedgerWalletAPITransport } from "../contexts"

// Created based on the
// https://github.com/keep-network/tbtc-v2/blob/main/typescript/src/lib/utils/ledger.ts.
function serializeLedgerWalletApiEthereumTransaction(
  transaction: TransactionRequest,
): EthereumTransaction {
  const {
    value,
    to,
    nonce,
    data,
    gasPrice,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = transaction

  const ethereumTransaction: EthereumTransaction = {
    family: "ethereum" as const,
    // @ts-expect-error We do not want to install external bignumber.js lib so
    // here we use bigint. The Ledger Wallet Api just converts the bignumber.js
    // object to string so we can pass bigint. See:
    // https://github.com/LedgerHQ/wallet-api/blob/main/packages/core/src/families/ethereum/serializer.ts#L4
    amount: value ?? 0,
    recipient: to?.toString() || ZeroAddress,
    nonce: nonce ?? undefined,
    // @ts-expect-error See comment above.
    gasPrice: gasPrice ?? undefined,
    // @ts-expect-error See comment above.
    gasLimit: gasLimit ?? undefined,
    // @ts-expect-error See comment above.
    maxFeePerGas: maxFeePerGas ?? undefined,
    // @ts-expect-error See comment above.
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? undefined,
  }

  if (nonce) ethereumTransaction.nonce = Number(nonce)
  if (data)
    ethereumTransaction.data = Buffer.from(
      Hex.from(data.toString()).toString(),
      "hex",
    )

  return ethereumTransaction
}
// Created based on the
// https://github.com/keep-network/tbtc-v2/blob/main/typescript/src/lib/utils/ledger.ts
// but with support for ethers v6.
class LedgerWalletSigner extends EthereumSignerCompatibleWithEthersV5 {
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

    return new LedgerWalletSigner(
      dappTransport,
      client,
      account,
      // TODO: Pass the Ethereum node url via Env variable.
      new JsonRpcProvider(
        "https://goerli.infura.io/v3/c80e8ccdcc4c4a809bce4fc165310617",
      ),
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
    return new LedgerWalletSigner(
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

  // eslint-disable-next-line consistent-return
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

export { LedgerWalletSigner }
