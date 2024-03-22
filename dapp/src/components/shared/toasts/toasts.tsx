import React from "react"
import { TOAST_TYPES, ToastType } from "#/types"
import { UseToastOptions } from "@chakra-ui/react"
import { WalletErrorToast } from "./WalletErrorToast"
import { MessageSigningErrorToast } from "./MessageSigningErrorToast"
import { DepositTransactionErrorToast } from "./DepositTransactionErrorToast"

const {
  BITCOIN_WALLET_NOT_CONNECTED_ERROR,
  ETHEREUM_WALLET_NOT_CONNECTED_ERROR,
  SIGNING_ERROR,
  DEPOSIT_TRANSACTION_ERROR,
} = TOAST_TYPES

export const TOASTS: Record<
  ToastType,
  (params?: { onClick: () => void }) => UseToastOptions
> = {
  [BITCOIN_WALLET_NOT_CONNECTED_ERROR]: (params) => ({
    id: BITCOIN_WALLET_NOT_CONNECTED_ERROR,
    render: ({ onClose }) => (
      <WalletErrorToast
        title="Bitcoin wallet is not connected"
        onClose={onClose}
        onClick={params?.onClick}
      />
    ),
  }),
  [ETHEREUM_WALLET_NOT_CONNECTED_ERROR]: (params) => ({
    id: ETHEREUM_WALLET_NOT_CONNECTED_ERROR,
    render: ({ onClose }) => (
      <WalletErrorToast
        title="Ethereum wallet is not connected."
        onClose={onClose}
        onClick={params?.onClick}
      />
    ),
  }),
  [SIGNING_ERROR]: () => ({
    id: SIGNING_ERROR,
    render: ({ onClose }) => <MessageSigningErrorToast onClose={onClose} />,
  }),
  [DEPOSIT_TRANSACTION_ERROR]: () => ({
    id: DEPOSIT_TRANSACTION_ERROR,
    render: ({ onClose }) => <DepositTransactionErrorToast onClose={onClose} />,
  }),
}
