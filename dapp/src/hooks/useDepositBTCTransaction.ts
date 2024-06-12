import { useCallback, useEffect, useState } from "react"
import { OnErrorCallback, OnSuccessCallback } from "#/types"
import { useWallet } from "./useWallet"
import { useOrangeKitConnector } from "./useOrangeKitConnector"

type SendBitcoinTransactionParams = Parameters<
  (recipient: string, amount: bigint) => void
>

type UseDepositBTCTransactionReturn = {
  transactionHash?: string
  sendBitcoinTransaction: (
    ...params: SendBitcoinTransactionParams
  ) => Promise<void>
}

export function useDepositBTCTransaction(
  onSuccess?: OnSuccessCallback,
  onError?: OnErrorCallback,
): UseDepositBTCTransactionReturn {
  const connector = useOrangeKitConnector()
  const { address } = useWallet()

  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    if (transactionHash && onSuccess) {
      onSuccess()
    }
  }, [onSuccess, transactionHash])

  const sendBitcoinTransaction = useCallback(
    async (recipient: string, amount: bigint) => {
      if (!address) {
        throw new Error("Bitcoin account was not connected.")
      }

      if (!connector) {
        throw new Error("Connector was not defined.")
      }

      const client = await connector.getClient()

      try {
        // TODO: Temporary solution - The `sendBitcoin` function accepts amount as number
        const satoshis = +amount.toString()

        // @ts-expect-error adjust types to handle bitcoin wallet wrappers
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const txhash: string = await client?.sendBitcoin(recipient, satoshis)
        setTransactionHash(txhash)
      } catch (error) {
        if (onError) {
          onError(error)
        }
        console.error(error)
      }
    },
    [address, connector, onError],
  )

  return { sendBitcoinTransaction, transactionHash }
}
