import {
  Account,
  defaultLogger,
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { ethers } from "ethers"
import { UserRejectedRequestError } from "viem"
import {
  Balance,
  BitcoinAddress,
  BitcoinTxHash,
  OrangeKitBitcoinWalletProvider,
} from "@orangekit/react/src/wallet/bitcoin-wallet-provider"
import {
  BitcoinAddressHelper,
  BitcoinNetwork,
  BitcoinProvider,
} from "@acre-btc/sdk"
import {
  AcreMessage,
  AcreMessageType,
  AcreModule,
  AcreWithdrawalData,
} from "@ledgerhq/wallet-api-acre-module"

export type TryRequestFn<T> = (fn: () => Promise<T>) => Promise<T>

function tryRequest<T>(): TryRequestFn<T> {
  return async (fn) => {
    try {
      return await fn()
    } catch (error: unknown) {
      const err = error as Error

      // We want to throw the same error for all connectors when user rejects
      // the request.
      if (
        err?.message === "UserRefusedOnDevice" ||
        err?.message === "Canceled by user"
      ) {
        throw new UserRejectedRequestError(err)
      }

      throw error
    }
  }
}

export type LedgerLiveWalletApiBitcoinProviderOptions = {
  tryConnectToAddress: string | undefined
}

/**
 * Ledger Live Wallet API Bitcoin Provider.
 */
export default class AcreLedgerLiveBitcoinProvider
  implements OrangeKitBitcoinWalletProvider, BitcoinProvider
{
  readonly #walletApiClient: WalletAPIClient<
    (client: WalletAPIClient) => { acre: AcreModule }
  >

  readonly #windowMessageTransport: WindowMessageTransport

  readonly #network: BitcoinNetwork

  readonly #options: LedgerLiveWalletApiBitcoinProviderOptions

  readonly #hwAppId = "Acre"

  #hasConnectFunctionBeenCalled: boolean = false

  #account: Account | undefined

  static init(
    network: BitcoinNetwork,
    options: LedgerLiveWalletApiBitcoinProviderOptions = {
      tryConnectToAddress: undefined,
    },
  ) {
    const windowMessageTransport = new WindowMessageTransport()
    windowMessageTransport.connect()

    const walletApiClient = new WalletAPIClient(
      windowMessageTransport,
      defaultLogger,
      (client: WalletAPIClient) => ({ acre: new AcreModule(client) }),
    )

    return new AcreLedgerLiveBitcoinProvider(
      network,
      windowMessageTransport,
      walletApiClient,
      options,
    )
  }

  constructor(
    network: BitcoinNetwork,
    windowMessageTransport: WindowMessageTransport,
    walletApiClient: WalletAPIClient,
    options: LedgerLiveWalletApiBitcoinProviderOptions = {
      tryConnectToAddress: undefined,
    },
  ) {
    this.#network = network
    this.#windowMessageTransport = windowMessageTransport
    this.#walletApiClient = walletApiClient
    this.#options = options
  }

  /**
   * Connects with the Ledger Live Wallet API.
   * @returns Connected account address.
   */
  async connect(): Promise<BitcoinAddress> {
    this.#windowMessageTransport.connect()

    const currencyIds = [
      this.#network === BitcoinNetwork.Mainnet ? "bitcoin" : "bitcoin_testnet",
    ]

    if (!this.#hasConnectFunctionBeenCalled) {
      const accounts: Account[] = await this.#walletApiClient.account.list({
        currencyIds,
      })

      if (this.#options.tryConnectToAddress) {
        for (let i = 0; i < accounts.length; i += 1) {
          const acc = accounts[i]
          // eslint-disable-next-line no-await-in-loop
          const address = await this.#getAddress(acc.id)

          if (address === this.#options.tryConnectToAddress) {
            this.#account = acc
            break
          }
        }
      } else if (accounts.length === 1) {
        ;[this.#account] = accounts
      }
    }

    if (!this.#account || this.#hasConnectFunctionBeenCalled) {
      this.#account = await tryRequest<Account>()(async () =>
        this.#walletApiClient.account.request({
          currencyIds,
        }),
      )
    }

    this.#hasConnectFunctionBeenCalled = true
    return this.#account.address
  }

  /**
   * Signs and broadcasts a transaction.
   * @param to The address of the transaction's recipient.
   * @param satoshis The amount of Bitcoin in satoshi to send in the
   *        transaction.
   * @returns The transaction hash
   */
  async sendBitcoin(
    to: BitcoinAddress,
    satoshis: number,
  ): Promise<BitcoinTxHash> {
    if (this.#account === undefined) {
      throw new Error("Connect first")
    }

    const txHash = await tryRequest<string>()(() =>
      this.#walletApiClient.custom.acre.transactionSignAndBroadcast(
        this.#account!.id,
        {
          family: "bitcoin",
          // @ts-expect-error The Ledger Live lib requires `BigNumber` but we can
          // pass string.
          amount: satoshis.toString(),
          recipient: to,
        },
        { hwAppId: this.#hwAppId },
      ),
    )

    return txHash
  }

  /**
   * @returns The account Bitcoin balance.
   */
  async getBalance(): Promise<Balance> {
    if (this.#account === undefined) {
      throw new Error("Connect first")
    }

    const account = (
      await this.#walletApiClient.account.list({
        currencyIds: [
          this.#network === BitcoinNetwork.Mainnet
            ? "bitcoin"
            : "bitcoin_testnet",
        ],
      })
    ).find((acc) => acc.id === this.#account!.id)

    if (!account) {
      throw new Error("Failed to get account balance")
    }

    const total = BigInt(account.balance.toString())
    const confirmed = BigInt(account.spendableBalance.toString())

    const balance: Balance = {
      total: total.toString(),
      confirmed: confirmed.toString(),
      unconfirmed: (total - confirmed).toString(),
    }

    return balance
  }

  // eslint-disable-next-line class-methods-use-this
  isInstalled(): boolean {
    return true
  }

  /**
   * Closes the connection with Ledger Live Wallet API.
   */
  disconnect(): Promise<void> {
    this.#account = undefined
    this.#windowMessageTransport.disconnect()

    return Promise.resolve()
  }

  /**
   * In the Ledger Live Wallet API the address is "renewed" each time funds are
   * received in order to allow some privacy. But to get the same depositor
   * owner Ethereum address we must always get the same Bitcoin address (under
   * the `m/purpose'/0'/accountId'/0/0` derivation path)
   *
   * @returns Always the same bitcoin address even the address has been
   *          "renewed" by the Ledger Live Wallet API.
   */
  async getAddress(): Promise<string> {
    if (this.#account === undefined) {
      throw new Error("Connect first")
    }

    return this.#getAddress(this.#account.id)
  }

  #getAddress(accountId: string, derivationPath: string = "0/0") {
    return this.#walletApiClient.bitcoin.getAddress(accountId, derivationPath)
  }

  /**
   * Signs withdraw message.
   * @param message Message to sign.
   * @param data Withdrawal transaction data.
   * @returns Hash of the signed message.
   */
  async signWithdrawMessage(
    message: string,
    data: Omit<AcreWithdrawalData, "operation" | "nonce"> & {
      operation: number
      nonce: number
    },
  ) {
    return this.#signMessage({
      type: AcreMessageType.Withdraw,
      message: {
        ...data,
        operation: data.operation.toString(),
        nonce: data.nonce.toString(),
      },
    })
  }

  /**
   * Signs message.
   * @param message Message to sign.
   * @returns Hash of the signed message.
   */
  async signMessage(message: string): Promise<string> {
    return this.#signMessage({ type: AcreMessageType.SignIn, message })
  }

  async #signMessage(message: AcreMessage) {
    if (!this.#account) throw new Error("Connect first")

    const signature = await tryRequest<Buffer>()(async () =>
      this.#walletApiClient.custom.acre.messageSign(
        this.#account!.id,
        message,
        "0/0",
        { hwAppId: this.#hwAppId },
      ),
    )

    return this.#normalizeV(this.#account.address, signature)
  }

  async #normalizeV(address: string, signature: Buffer) {
    const signatureBytes = ethers.decodeBase64(signature.toString("base64"))

    const v = signatureBytes[0]
    let normalizedV

    if (BitcoinAddressHelper.isP2WPKHAddress(address)) {
      // For p2wpkh, normalize to the 39-42 range specified by BIP137.
      normalizedV = BitcoinAddressHelper.normalizeV(v, 39)
    } else if (BitcoinAddressHelper.isP2PKHAddress(address)) {
      // For p2pkh, assume that an uncompressed p2pkh signature will already be
      // in the right range, and normalize any others to the 31-34 range
      // specified by BIP137.
      normalizedV =
        // BIP137 range for uncompressed p2pkh
        v >= 27 && v <= 30
          ? v
          : // BIP137 range for compressed p2pkh
            BitcoinAddressHelper.normalizeV(v, 31)
    } else if (
      BitcoinAddressHelper.isNestedSegwitAddress(
        // We need the zero address to confirm that this is indeed the nested
        // segwit address.
        await this.getAddress(),
        await this.getPublicKey(),
      )
    ) {
      normalizedV = BitcoinAddressHelper.normalizeV(v, 35)
    } else {
      throw new Error("Unsupported Bitcoin address type")
    }

    signatureBytes[0] = normalizedV

    return ethers.hexlify(signatureBytes)
  }

  /**
   * @returns The public key of the Bitcoin account.
   */
  async getPublicKey(): Promise<string> {
    if (this.#account === undefined) {
      throw new Error("Connect first")
    }

    return this.#walletApiClient.bitcoin.getPublicKey(this.#account.id, "0/0")
  }
}
