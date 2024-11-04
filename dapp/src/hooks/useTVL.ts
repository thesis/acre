import {
  queryKeysFactory,
  REFETCH_INTERVAL_IN_MILLISECONDS,
  TOTAL_VALUE_LOCKED_CAP,
} from "#/constants"
import { acreApi } from "#/utils"
import { useQuery } from "@tanstack/react-query"

const { acreKeys } = queryKeysFactory

const useTVL = () => {
  const { data } = useQuery({
    queryKey: [...acreKeys.totalAssets()],
    queryFn: acreApi.getStatistics,
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })

  const totalAssets = data?.btc ?? 0

  const isCapExceeded = totalAssets > TOTAL_VALUE_LOCKED_CAP

  const progress = Math.floor(
    isCapExceeded ? 100 : (totalAssets / TOTAL_VALUE_LOCKED_CAP) * 100,
  )
  const value = isCapExceeded ? TOTAL_VALUE_LOCKED_CAP : totalAssets

  return {
    progress,
    value,
    isCapExceeded,
  }
}

export default useTVL
