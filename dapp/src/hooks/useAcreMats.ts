import { useQuery } from "@tanstack/react-query"
import { REFETCH_INTERVAL_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import { mezoPortalAPI } from "#/utils"

const { acreKeys } = queryKeysFactory

export default function useAcreMats() {
  return useQuery({
    queryKey: [...acreKeys.mats()],
    queryFn: async () => mezoPortalAPI.getAcreMats(),
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}
