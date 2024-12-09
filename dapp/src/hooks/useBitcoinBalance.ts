import { useQuery } from "@tanstack/react-query"
import { REFETCH_INTERVAL_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import useWalletAddress from "./store/useWalletAddress"
import { useBitcoinProvider } from "./orangeKit/useBitcoinProvider"

const { userKeys } = queryKeysFactory

export default function useBitcoinBalance() {
  const address = useWalletAddress()
  const provider = useBitcoinProvider()

  return useQuery({
    queryKey: [...userKeys.balance(), { provider, address }],
    enabled: !!provider && !!address,
    queryFn: async () => {
      if (!provider || !address) return 0n

      const { total } = await provider.getBalance()
      return BigInt(total)
    },
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
