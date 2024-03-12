import { useEffect, useState } from "react"
import { mockedStakerStatistics, mockedProtocolStatistics } from "#/mocks"
import { ProtocolStatistics } from "#/types"

export function useStakingStats() {
  // TODO: change when real data will be available
  const [statistics, setStatistic] = useState<ProtocolStatistics>()
  const isStaking = true

  useEffect(() => {
    setStatistic(isStaking ? mockedStakerStatistics : mockedProtocolStatistics)
  }, [isStaking])

  return { isStaking, statistics }
}
