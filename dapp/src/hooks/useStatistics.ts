import { queryKeysFactory, REFETCH_INTERVAL_IN_MILLISECONDS } from "#/constants"
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
  const tvlCap = data?.cap ?? 0

  const isCapExceeded = bitcoinTvl > tvlCap

  const progress = isCapExceeded ? 100 : Math.floor((bitcoinTvl / tvlCap) * 100)

  const remaining = isCapExceeded ? 0 : tvlCap - bitcoinTvl

  return {
    tvl: {
      progress,
      value: bitcoinTvl,
      usdValue: usdTvl,
      isCapExceeded,
      remaining,
      cap: tvlCap,
    },
  }
}

export default useStatistics
