import { ConnectionErrorData } from "#/types"
import {
  isUnsupportedBitcoinAddressError,
  isWalletNetworkDoesNotMatchProviderChainError,
} from "@orangekit/react"
import { Connector } from "wagmi"

const isConnectedStatus = (status: string) => status === "connected"

const isOrangeKitConnector = (connector?: Connector) =>
  connector?.type === "orangekit"

const parseOrangeKitConnectionError = (error: unknown) => {
  let errorData: ConnectionErrorData = {
    title: "Something went wrong...",
    description: "We encountered an error. Please try again.",
  }

  if (isUnsupportedBitcoinAddressError(error)) {
    errorData = {
      title: "Not supported.",
      description:
        "Only Native Segwit, Nested Segwit or Legacy addresses supported at this time. Please try a different address or another wallet.",
    }
  }

  if (isWalletNetworkDoesNotMatchProviderChainError(error)) {
    errorData = {
      title: "Error!",
      description:
        "Wrong network detected in your wallet. Please choose proper network and try again.",
    }
  }

  return errorData
}

export default {
  isOrangeKitConnector,
  isConnectedStatus,
  parseOrangeKitConnectionError,
}
