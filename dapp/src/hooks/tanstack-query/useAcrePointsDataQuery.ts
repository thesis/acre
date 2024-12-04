import { queryKeysFactory, REFETCH_INTERVAL_IN_MILLISECONDS } from "#/constants"
import { useQuery } from "@tanstack/react-query"
import { acreApi } from "#/utils"

const { acreKeys } = queryKeysFactory

export default function useAcrePointsDataQuery() {
  return useQuery({
    queryKey: [...acreKeys.pointsData()],
    queryFn: async () => acreApi.getPointsData(),
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
