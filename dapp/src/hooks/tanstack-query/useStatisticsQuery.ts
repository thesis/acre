import { useQuery } from "@tanstack/react-query"
import { REFETCH_INTERVAL_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import { acreApi } from "#/utils"

const { acreKeys } = queryKeysFactory

export default function useStatisticsQuery() {
  return useQuery({
    queryKey: [...acreKeys.statistics()],
    queryFn: acreApi.getStatistics,
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
