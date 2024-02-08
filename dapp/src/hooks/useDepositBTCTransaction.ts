import { useCallback } from "react"
import { useSignAndBroadcastTransaction } from "@ledgerhq/wallet-api-client-react"
import BigNumber from "bignumber.js"
import { Transaction } from "@ledgerhq/wallet-api-client"
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

export function useDepositBTCTransaction(): UseDepositBTCTransactionReturn {
  const { btcAccount } = useWalletContext()
  const { walletApiReactTransport } = useWalletApiReactTransport()

  const { signAndBroadcastTransaction, ...rest } =
    useSignAndBroadcastTransaction()

  const sendBitcoinTransaction = useCallback(
    async (amount: bigint, recipient: string) => {
      if (!btcAccount) {
        throw new Error("Bitcoin account was not connected.")
      }

      const bitcoinTransaction: Transaction = {
        family: "bitcoin",
        amount: new BigNumber(amount.toString()),
        recipient,
      }
      walletApiReactTransport.connect()
      await signAndBroadcastTransaction(btcAccount.id, bitcoinTransaction)
      walletApiReactTransport.disconnect()
    },
    [btcAccount, signAndBroadcastTransaction, walletApiReactTransport],
  )

  return { ...rest, sendBitcoinTransaction }
}
