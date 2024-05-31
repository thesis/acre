import { ReactNode } from "react"
import {
  DepositTransactionErrorToast,
  SigningMessageErrorToast,
  WalletErrorToast,
} from "#/components/toasts"

export const TOAST_IDS = {
  BITCOIN_WALLET_ERROR: "bitcoin-wallet-error",
  SIGNING_ERROR: "signing-error",
  DEPOSIT_TRANSACTION_ERROR: "deposit-transaction-error",
} as const

export type ToastID = (typeof TOAST_IDS)[keyof typeof TOAST_IDS]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TOASTS: Record<ToastID, (props: any) => ReactNode> = {
  [TOAST_IDS.BITCOIN_WALLET_ERROR]: WalletErrorToast,
  [TOAST_IDS.SIGNING_ERROR]: SigningMessageErrorToast,
  [TOAST_IDS.DEPOSIT_TRANSACTION_ERROR]: DepositTransactionErrorToast,
}
