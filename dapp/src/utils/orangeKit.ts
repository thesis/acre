import {
  ACRE_SESSION_EXPIRATION_TIME,
  CONNECTION_ERRORS,
  wallets,
} from "#/constants"
import {
  ConnectionErrorData,
  OrangeKitError,
  OrangeKitConnector,
} from "#/types"
import {
  isUnsupportedBitcoinAddressError,
  isWalletNetworkDoesNotMatchProviderChainError,
} from "@orangekit/react"
import { Connector } from "wagmi"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"
import LedgerLiveWalletApiBitcoinProvider, {
  LedgerLiveWalletApiBitcoinProviderOptions,
} from "@orangekit/react/dist/src/wallet/ledger-live/provider"
import LedgerLiveConnectorIcon from "@orangekit/react/dist/src/wallet/ledger-live/icon"
import {
  AcreMessageType,
  AcreModule,
  AcreWithdrawalData,
} from "@ledgerhq/wallet-api-acre-module"
import { BitcoinProvider } from "@acre-btc/sdk"
import {
  ConnectorConfig,
  createOrangeKitConnector,
} from "@orangekit/react/dist/src/wallet/connector"
import { getExpirationDate } from "./time"

const getWalletInfo = (connector: OrangeKitConnector) => {
  switch (connector.id) {
    case wallets.UNISAT.id:
      return wallets.UNISAT
    case wallets.OKX.id:
      return wallets.OKX
    case wallets.XVERSE.id:
      return wallets.XVERSE
    default:
      return null
  }
}

const isWalletInstalled = (connector: OrangeKitConnector) => {
  const provider = connector.getBitcoinProvider()
  return provider.isInstalled()
}

const isWalletConnectionRejectedError = (cause: OrangeKitError["cause"]) =>
  cause && cause.code === 4001

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

const createSignInWithWalletMessage = (address: string, nonce: string) => {
  const { host: domain, origin: uri } = window.location

  const message = new SignInWithWalletMessage({
    domain,
    address,
    uri,
    issuedAt: new Date().toISOString(),
    version: "1",
    networkFamily: "bitcoin",
    expirationTime: getExpirationDate(
      ACRE_SESSION_EXPIRATION_TIME,
    ).toISOString(),
    nonce,
  })

  return message.prepareMessage()
}

const typeConversionToOrangeKitConnector = (
  connector?: Connector,
): OrangeKitConnector => connector as unknown as OrangeKitConnector

const typeConversionToConnector = (connector?: OrangeKitConnector): Connector =>
  connector as unknown as Connector

const parseOrangeKitConnectionError = (
  error: OrangeKitError,
): ConnectionErrorData => {
  const { cause } = error

  if (isWalletConnectionRejectedError(cause)) {
    return CONNECTION_ERRORS.REJECTED
  }

  if (isUnsupportedBitcoinAddressError(cause)) {
    return CONNECTION_ERRORS.NOT_SUPPORTED
  }

  if (isWalletNetworkDoesNotMatchProviderChainError(cause)) {
    return CONNECTION_ERRORS.NETWORK_MISMATCH
  }

  return CONNECTION_ERRORS.DEFAULT
}

async function verifySignInWithWalletMessage(
  messageToSign: string,
  signedMessage: `0x${string}`,
) {
  const signInWithWallet = new SignInWithWalletMessage(messageToSign)

  const result = await signInWithWallet.verify({ signature: signedMessage })

  if (!result.success) {
    throw (
      result.error ??
      new Error("Unexpected error when verifying Sign In With Wallet request")
    )
  }

  return result.data
}

type Client = (client: unknown) => {
  acre: AcreModule
}

export class AcreLedgerLiveBitcoinProvider
  extends LedgerLiveWalletApiBitcoinProvider<Client>
  implements BitcoinProvider
{
  constructor(
    network: "mainnet" | "testnet",
    options?: LedgerLiveWalletApiBitcoinProviderOptions,
  ) {
    super(network, {
      tryConnectToAddress: options?.tryConnectToAddress,
      // @ts-expect-error we do not have an access to the `WalletApiClient`
      // type.
      getCustomModule: (client) => ({ acre: new AcreModule(client) }),
    })
  }

  async signWithdrawMessage(
    message: string,
    data: Omit<AcreWithdrawalData, "operation" | "nonce"> & {
      operation: number
      nonce: number
    },
  ) {
    if (!this.account) throw new Error("Connect first")

    const signature = await this.walletApiClient.custom.acre.messageSign(
      this.account.id,
      {
        type: AcreMessageType.Withdraw,
        message: {
          ...data,
          operation: data.operation.toString(),
          nonce: data.nonce.toString(),
        },
      },
      "0/0",
    )

    return signature.toString("hex")
  }

  async signMessage(message: string): Promise<string> {
    if (!this.account) throw new Error("Connect first")

    const signature = await this.walletApiClient.custom.acre.messageSign(
      this.account.id,
      {
        type: AcreMessageType.SignIn,
        message,
      },
      "0/0",
    )

    return this.normalizeV(this.account.address, signature)
  }
}

function getOrangeKitLedgerLiveConnector({
  rpcUrl,
  chainId,
  relayApiKey,
  options,
}: ConnectorConfig<LedgerLiveWalletApiBitcoinProviderOptions>) {
  const bitcoinWalletProvider = new AcreLedgerLiveBitcoinProvider(
    chainId === 1 ? "mainnet" : "testnet",
    options,
  )

  return () =>
    createOrangeKitConnector(
      "orangekit-ledger-live",
      "Ledger Live",
      LedgerLiveConnectorIcon,
      rpcUrl,
      chainId,
      bitcoinWalletProvider,
      relayApiKey,
    )
}

export default {
  getWalletInfo,
  isWalletInstalled,
  isOrangeKitConnector,
  isConnectedStatus,
  createSignInWithWalletMessage,
  typeConversionToOrangeKitConnector,
  typeConversionToConnector,
  parseOrangeKitConnectionError,
  isWalletConnectionRejectedError,
  verifySignInWithWalletMessage,
  getOrangeKitLedgerLiveConnector,
}
