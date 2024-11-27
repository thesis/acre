import { ACRE_SESSION_EXPIRATION_TIME, wallets } from "#/constants"
import { OrangeKitError, OrangeKitConnector } from "#/types"
import {
  isUnsupportedBitcoinAddressError,
  isWalletNetworkDoesNotMatchProviderChainError,
} from "@orangekit/react"
import { Connector } from "wagmi"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"
import { ConnectionAlert } from "#/components/ConnectWalletModal/ConnectWalletAlert"
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
): ConnectionAlert => {
  const { cause } = error

  if (isWalletConnectionRejectedError(cause)) {
    return ConnectionAlert.Rejected
  }

  if (isUnsupportedBitcoinAddressError(cause)) {
    return ConnectionAlert.NotSupported
  }

  if (isWalletNetworkDoesNotMatchProviderChainError(cause)) {
    return ConnectionAlert.NetworkMismatch
  }

  return ConnectionAlert.Default
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
