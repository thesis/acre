import { OnErrorCallback, OnSuccessCallback } from "#/types"
import { useMutation } from "@tanstack/react-query"
import { useWallet } from "./useWallet"
import { useConnector } from "./orangeKit/useConnector"

export function useDepositBTCTransaction(
  onSuccess?: OnSuccessCallback<string>,
  onError?: OnErrorCallback,
) {
  const connector = useConnector()
  const { address } = useWallet()

  const {
    mutate: sendBitcoinTransaction,
    status,
    data,
  } = useMutation({
    mutationKey: ["send-bitcoin"],
    mutationFn: async ({
      recipient,
      amount,
    }: {
      recipient: string
      amount: bigint
    }) => {
      if (!address) {
        throw new Error("Bitcoin account was not connected.")
      }

      if (!connector) {
        throw new Error("Connector was not defined.")
      }
      // @ts-expect-error adjust types to handle bitcoin wallet wrappers
      const client = await connector.getClient()

      const satoshis = Number(amount)

      // @ts-expect-error adjust types to handle bitcoin wallet wrappers
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const txhash: string = await client.sendBitcoin(recipient, satoshis)
      return txhash
    },
    onSuccess: (responseData) => onSuccess?.(responseData),
    onError: (error) => {
      onError?.(error)
      console.error(error)
    },
  })

  return { sendBitcoinTransaction, status, data }
}
