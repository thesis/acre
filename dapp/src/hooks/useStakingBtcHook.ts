import { useEffect, useState } from "react"
import {
  mockedStakerStatistics,
  mockedProtocolStatistics,
} from "#/mocks/mock-statistics"
import { StatisticType } from "#/types"

export function useStakingBtcHook() {
  // TODO: change when real data will be available
  const [statistics, setStatistic] = useState<StatisticType[]>()
  const isStakingBtc = false

  useEffect(() => {
    if (isStakingBtc) {
      setStatistic(mockedStakerStatistics)
    } else {
      setStatistic(mockedProtocolStatistics)
    }
  }, [isStakingBtc])

  return statistics || null
}
