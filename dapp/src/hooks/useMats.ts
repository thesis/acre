import { useQuery } from "@tanstack/react-query"
import { time, queryKeysFactory } from "#/constants"
import { acreApi } from "#/utils"

const { acreKeys } = queryKeysFactory

export default function useMats() {
  return useQuery({
    queryKey: [...acreKeys.mats()],
    queryFn: async () => acreApi.getMats(),
    refetchInterval: time.REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
