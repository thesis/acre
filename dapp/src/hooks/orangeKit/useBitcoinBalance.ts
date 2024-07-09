import { useQuery } from "@tanstack/react-query"
import { REFETCH_INTERVAL_IN_MILLISECONDS, queryKeys } from "#/constants"
import { useBitcoinProvider } from "./useBitcoinProvider"

export default function useBitcoinBalance() {
  const provider = useBitcoinProvider()

  return useQuery({
    queryKey: [queryKeys.BITCOIN_BALANCE, { provider }],
    queryFn: async () => {
      if (!provider) return 0n

      const { total } = await provider.getBalance()
      return BigInt(total)
    },
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
