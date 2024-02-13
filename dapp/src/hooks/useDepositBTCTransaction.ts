import { useCallback, useEffect } from "react"
import { useSignAndBroadcastTransaction } from "@ledgerhq/wallet-api-client-react"
import { RawBitcoinTransaction } from "@ledgerhq/wallet-api-client"
import { OnErrorCallback, OnSuccessCallback } from "#/types"
import { useWalletContext } from "./useWalletContext"
import { useWalletApiReactTransport } from "./useWalletApiReactTransport"

type UseSendBitcoinTransactionState = {
  pending: boolean
  transactionHash: string | null
  error: unknown
}

type SendBitcoinTransactionParams = Parameters<
  (amount: bigint, recipient: string) => void
>

type UseDepositBTCTransactionReturn = {
  sendBitcoinTransaction: (
    ...params: SendBitcoinTransactionParams
  ) => Promise<void>
} & UseSendBitcoinTransactionState

export function useDepositBTCTransaction(
  onSuccess?: OnSuccessCallback,
  onError?: OnErrorCallback,
): UseDepositBTCTransactionReturn {
  const { btcAccount } = useWalletContext()
  const { walletApiReactTransport } = useWalletApiReactTransport()

  const { signAndBroadcastTransaction, transactionHash, error, ...rest } =
    useSignAndBroadcastTransaction()

  useEffect(() => {
    if (transactionHash && onSuccess) {
      onSuccess()
    }
  }, [onSuccess, transactionHash])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [onError, error])

  const sendBitcoinTransaction = useCallback(
    async (amount: bigint, recipient: string) => {
      if (!btcAccount) {
        throw new Error("Bitcoin account was not connected.")
      }

      const bitcoinTransaction: RawBitcoinTransaction = {
        family: "bitcoin",
        amount: amount.toString(),
        recipient,
      }

      walletApiReactTransport.connect()
      // @ts-expect-error We do not want to install external bignumber.js lib so
      // here we use bigint. The Ledger Wallet Api just converts the bignumber.js
      // object to string so we can pass bigint. See:
      // https://github.com/LedgerHQ/wallet-api/blob/main/packages/core/src/families/bitcoin/serializer.ts#L13
      await signAndBroadcastTransaction(btcAccount.id, bitcoinTransaction)
      walletApiReactTransport.disconnect()
    },
    [btcAccount, signAndBroadcastTransaction, walletApiReactTransport],
  )

  return { ...rest, sendBitcoinTransaction, transactionHash, error }
}
