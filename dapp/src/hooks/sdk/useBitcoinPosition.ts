import { useAcreContext } from "#/acre-react/hooks"
import { useQuery } from "@tanstack/react-query"
import { REFETCH_INTERVAL_IN_MILLISECONDS, queryKeys } from "#/constants"

export default function useBitcoinPosition() {
  const { acre, isInitialized } = useAcreContext()

  return useQuery({
    queryKey: [queryKeys.BITCOIN_POSITION, { acre, isInitialized }],
    queryFn: async () => {
      if (!isInitialized || !acre)
        return { sharesBalance: 0n, estimatedBitcoinBalance: 0n }

      const sharesBalance = await acre.account.sharesBalance()
      const estimatedBitcoinBalance =
        await acre.account.estimatedBitcoinBalance()

      return { sharesBalance, estimatedBitcoinBalance }
    },
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
