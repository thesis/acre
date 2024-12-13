import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useConnector } from "./orangeKit"
import useWallet from "./useWallet"

type MutationFnParams = {
  recipient: string
  amount: bigint
}

type UseDepositBTCTransactionOptions = Omit<
  UseMutationOptions<string, Error, MutationFnParams>,
  "mutationKey" | "mutationFn"
>

export default function useDepositBTCTransaction(
  options: UseDepositBTCTransactionOptions,
) {
  const connector = useConnector()
  const { address } = useWallet()
  return useMutation({
    mutationKey: ["send-bitcoin"],
    mutationFn: async ({ recipient, amount }: MutationFnParams) => {
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
    ...options,
  })
}
