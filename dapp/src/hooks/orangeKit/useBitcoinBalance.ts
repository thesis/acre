import { useQuery } from "@tanstack/react-query"
import { INTERVAL_TIME_IN_MILLISECONDS } from "#/constants"
import { useBitcoinProvider } from "./useBitcoinProvider"

export default function useBitcoinBalance() {
  const provider = useBitcoinProvider()

  return useQuery({
    queryKey: ["bitcoinBalance", { provider }],
    queryFn: async () => {
      if (!provider) return 0n

      const { total } = await provider.getBalance()
      return BigInt(total)
    },
    refetchInterval: INTERVAL_TIME_IN_MILLISECONDS,
  })
}
