import { CONNECTION_ERRORS } from "#/constants"
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

const isWalletConnectionRejectedError = (cause: OrangeKitError["cause"]) =>
  cause && cause.code === 4001

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

const createSignInWithWalletMessage = (address: string) => {
  const { host: domain, origin: uri } = window.location

  const message = new SignInWithWalletMessage({
    domain,
    address,
    uri,
    issuedAt: new Date().toISOString(),
    version: "1",
    networkFamily: "bitcoin",
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

export default {
  isOrangeKitConnector,
  isConnectedStatus,
  createSignInWithWalletMessage,
  typeConversionToOrangeKitConnector,
  typeConversionToConnector,
  parseOrangeKitConnectionError,
  isWalletConnectionRejectedError,
}
