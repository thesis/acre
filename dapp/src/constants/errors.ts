import { ACTION_FLOW_TYPES, ConnectionErrorData } from "#/types"

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

export const TOKEN_FORM_ERRORS = {
  REQUIRED: "Please enter an amount.",
  EXCEEDED_VALUE:
    "The amount exceeds your current wallet balance. Add more funds to your wallet or lower the deposit amount.",
  INSUFFICIENT_VALUE: (formType: string, minValue: string) =>
    `The amount is below the minimum required ${formType} of ${minValue} BTC.`,
}

export const PASSWORD_FORM_ERRORS = {
  REQUIRED: "Please enter a password.",
  INCORRECT_VALUE: "Incorrect password. Please try again.",
  DEFAULT: "Something went wrong...",
}

export const ACTION_FORM_ERRORS = {
  [ACTION_FLOW_TYPES.STAKE]: TOKEN_FORM_ERRORS,
  [ACTION_FLOW_TYPES.UNSTAKE]: {
    ...TOKEN_FORM_ERRORS,
    EXCEEDED_VALUE: "Your Acre balance is insufficient.",
  },
}
