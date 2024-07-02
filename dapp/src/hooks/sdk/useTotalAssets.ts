import { useAcreContext } from "#/acre-react/hooks"
import { useQuery } from "@tanstack/react-query"
import { INTERVAL_TIME_IN_MILLISECONDS } from "#/constants"

export default function useTotalAssets() {
  const { acre, isInitialized } = useAcreContext()

  return useQuery({
    queryKey: ["totalAssets", { acre, isInitialized }],
    queryFn: async () => {
      if (!isInitialized || !acre) return 0n

      const totalAssets = await acre.protocol.totalAssets()
      return totalAssets
    },
    refetchInterval: INTERVAL_TIME_IN_MILLISECONDS,
  })
}
