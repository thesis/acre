import { ConnectionErrorData } from "#/types"
import {
  isUnsupportedBitcoinAddressError,
  isWalletNetworkDoesNotMatchProviderChainError,
} from "@orangekit/react"
import { Connector } from "wagmi"

const isWalletConnectionRejectedError = (error: unknown) => {
  // TODO: Get error type checker from OrangeKit library
  const { cause } = error as { cause: { code: number } }
  return cause.code === 4001
}

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

const parseOrangeKitConnectionError = (error: unknown): ConnectionErrorData => {
  if (isWalletConnectionRejectedError(error)) {
    return {
      title: "Wallet connection rejected.",
      description: "If you encountered an error, please try again.",
    }
  }

  if (isUnsupportedBitcoinAddressError(error)) {
    return {
      title: "Not supported.",
      description:
        "Only Native Segwit, Nested Segwit or Legacy addresses supported at this time. Please try a different address or another wallet.",
    }
  }

  if (isWalletNetworkDoesNotMatchProviderChainError(error)) {
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
}
