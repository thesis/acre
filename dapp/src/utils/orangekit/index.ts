import {
  ACRE_SESSION_EXPIRATION_TIME,
  CONNECTION_ALERTS,
  wallets,
} from "#/constants"
import {
  ConnectionAlertData,
  OrangeKitError,
  OrangeKitConnector,
} from "#/types"
import {
  isUnsupportedBitcoinAddressError,
  isWalletNetworkDoesNotMatchProviderChainError,
} from "@orangekit/react"
import { Connector } from "wagmi"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"
import { getExpirationDate } from "../time"
import { getOrangeKitLedgerLiveConnector } from "./ledger-live"

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
): ConnectionAlertData => {
  const { cause } = error

  if (isWalletConnectionRejectedError(cause)) {
    return CONNECTION_ALERTS.REJECTED
  }

  if (isUnsupportedBitcoinAddressError(cause)) {
    return CONNECTION_ALERTS.NOT_SUPPORTED
  }

  if (isWalletNetworkDoesNotMatchProviderChainError(cause)) {
    return CONNECTION_ALERTS.NETWORK_MISMATCH
  }

  return CONNECTION_ALERTS.DEFAULT
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

/**
 * Finds the extended public key (xpub) of the user's account from URL. Users
 * can be redirected to the exact app in the Ledger Live application. One of the
 * parameters passed via URL is `accountId` - the ID of the user's account in
 * Ledger Live.
 * @see https://developers.ledger.com/docs/ledger-live/exchange/earn/liveapp#url-parameters-for-direct-navigation
 *
 * @param {string} url Request url
 * @returns The extended public key (xpub) of the user's account if the search
 *          parameter `accountId` exists in the URL. Otherwise `undefined`.
 */
function findXpubFromUrl(url: string): string | undefined {
  const parsedUrl = new URL(url)

  const accountId = parsedUrl.searchParams.get("accountId")

  if (!accountId) return undefined

  // The fourth value separated by `:` is extended public key. See the
  // account ID template: `js:2:bitcoin_testnet:<xpub>:<address_type>`.
  const xpubFromAccountId = accountId.split(":")[3]

  if (!xpubFromAccountId) return undefined

  return xpubFromAccountId
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
  findXpubFromUrl,
}
