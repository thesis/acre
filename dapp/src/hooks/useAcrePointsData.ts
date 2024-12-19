import { queryKeysFactory, time } from "#/constants"
import { useQuery } from "@tanstack/react-query"
import { acreApi } from "#/utils"

const { acreKeys } = queryKeysFactory

export default function useAcrePointsData() {
  return useQuery({
    queryKey: [...acreKeys.pointsData()],
    queryFn: async () => acreApi.getPointsData(),
    refetchInterval: time.REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
