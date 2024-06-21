import { ConnectionErrorData, OrangeKitError } from "#/types"
import {
  isUnsupportedBitcoinAddressError,
  isWalletNetworkDoesNotMatchProviderChainError,
} from "@orangekit/react"
import { Connector } from "wagmi"

const isWalletConnectionRejectedError = (cause: OrangeKitError["cause"]) =>
  cause && cause.code === 4001

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

const parseOrangeKitConnectionError = (
  error: OrangeKitError,
): ConnectionErrorData => {
  const { cause } = error

  if (isWalletConnectionRejectedError(cause)) {
    return {
      title: "Wallet connection rejected.",
      description: "If you encountered an error, please try again.",
    }
  }

  if (isUnsupportedBitcoinAddressError(cause)) {
    return {
      title: "Not supported.",
      description:
        "Only Native Segwit, Nested Segwit or Legacy addresses supported at this time. Please try a different address or another wallet.",
    }
  }

  if (isWalletNetworkDoesNotMatchProviderChainError(cause)) {
    return {
      title: "Error!",
      description:
        "Wrong network detected in your wallet. Please choose proper network and try again.",
    }
  }

  return {
    title: "Something went wrong...",
    description: "We encountered an error. Please try again.",
  }
}

export default {
  isOrangeKitConnector,
  isConnectedStatus,
  parseOrangeKitConnectionError,
  isWalletConnectionRejectedError,
}
