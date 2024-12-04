import { queryKeysFactory } from "#/constants"
import { useQuery } from "@tanstack/react-query"
import { acreApi } from "#/utils"
import { useWallet } from "../useWallet"

const { userKeys } = queryKeysFactory

export default function useUserPointsDataQuery() {
  const { ethAddress = "" } = useWallet()

  return useQuery({
    queryKey: [...userKeys.pointsData(), ethAddress],
    enabled: !!ethAddress,
    queryFn: async () => acreApi.getPointsDataByUser(ethAddress),
  })
}
