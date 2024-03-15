export const TOAST_TYPES = {
  BITCOIN_WALLET_NOT_CONNECTED_ERROR: "bitcoin-wallet-error",
  ETHEREUM_WALLET_NOT_CONNECTED_ERROR: "ethereum-wallet-error",
  SIGNING_ERROR: "signing-error",
  DEPOSIT_TRANSACTION_ERROR: "deposit-transaction-error",
} as const

export type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES]
