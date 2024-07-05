import { useAcreContext } from "#/acre-react/hooks"
import { useQuery } from "@tanstack/react-query"
import { REFETCH_INTERVAL_IN_MILLISECONDS, queryKeys } from "#/constants"

export default function useTotalAssets() {
  const { acre, isInitialized } = useAcreContext()

  return useQuery({
    queryKey: [queryKeys.TOTAL_ASSETS, { acre, isInitialized }],
    queryFn: async () => {
      if (!isInitialized || !acre) return 0n

      const totalAssets = await acre.protocol.totalAssets()
      return totalAssets
    },
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
