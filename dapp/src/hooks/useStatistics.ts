import { useStatisticsQuery } from "./tanstack-query"

const useStatistics = () => {
  const { data } = useStatisticsQuery()

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
