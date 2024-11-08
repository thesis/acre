import {
  queryKeysFactory,
  REFETCH_INTERVAL_IN_MILLISECONDS,
  TOTAL_VALUE_LOCKED_CAP,
} from "#/constants"
import { acreApi } from "#/utils"
import { useQuery } from "@tanstack/react-query"

const { acreKeys } = queryKeysFactory

const useStatistics = () => {
  const { data } = useQuery({
    queryKey: [...acreKeys.statistics()],
    queryFn: acreApi.getStatistics,
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })

  const bitcoinTvl = data?.btc ?? 0
  const usdTvl = data?.usd ?? 0

  const isCapExceeded = bitcoinTvl > TOTAL_VALUE_LOCKED_CAP

  const progress = isCapExceeded
    ? 100
    : Math.floor((bitcoinTvl / TOTAL_VALUE_LOCKED_CAP) * 100)

  const remaining = isCapExceeded ? 0 : TOTAL_VALUE_LOCKED_CAP - bitcoinTvl

  return {
    tvl: {
      progress,
      value: bitcoinTvl,
      usdValue: usdTvl,
      isCapExceeded,
      remaining,
    },
  }
}

export default useStatistics
