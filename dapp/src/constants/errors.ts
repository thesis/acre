import { ConnectionErrorData } from "#/types"

export const CONNECTION_ERRORS: Record<string, ConnectionErrorData> = {
  REJECTED: {
    title: "Wallet connection rejected.",
    description: "If you encountered an error, please try again.",
  },
  NOT_SUPPORTED: {
    title: "Not supported.",
    description:
      "Only Native SegWit, Nested SegWit or Legacy addresses supported at this time. Please try a different address or another wallet.",
  },
  NETWORK_MISMATCH: {
    title: "Error!",
    description:
      "Incorrect network detected in your wallet. Please choose proper network and try again.",
  },
  DEFAULT: {
    title: "Something went wrong...",
    description: "We encountered an error. Please try again.",
  },
  INVALID_SIWW_SIGNATURE: {
    title: "Invalid Sign In With Wallet signature",
    description: "We encountered an error. Please try again.",
  },
}
