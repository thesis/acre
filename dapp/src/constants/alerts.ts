import { ConnectionAlertData } from "#/types"

export const CONNECTION_ALERTS: Record<string, ConnectionAlertData> = {
  REJECTED: {
    title: "Please connect your wallet to start using Acre",
    type: "info",
  },
  NOT_SUPPORTED: {
    title: "Not supported.",
    description:
      "Only Native SegWit, Nested SegWit or Legacy addresses supported at this time. Please try a different address or another wallet.",
    type: "error",
  },
  NETWORK_MISMATCH: {
    title: "Error!",
    description:
      "Incorrect network detected in your wallet. Please choose proper network and try again.",
    type: "error",
  },
  DEFAULT: {
    title: "Something went wrong...",
    description: "We encountered an error. Please try again.",
    type: "error",
  },
  INVALID_SIWW_SIGNATURE: {
    title: "Invalid Sign In With Wallet signature",
    description: "We encountered an error. Please try again.",
    type: "error",
  },
}
