import { SEASON_CAP } from "#/constants"
import { useTotalAssets } from "./store"

export const useSeasonProgress = () => {
  const totalAssets = useTotalAssets()
  const dividingResult = Number((totalAssets * 100n) / SEASON_CAP) / 100

  const isSeasonCapExceeded = totalAssets > SEASON_CAP

  const progress = isSeasonCapExceeded ? 100 : Math.floor(dividingResult * 100)
  const value = isSeasonCapExceeded ? SEASON_CAP : totalAssets

  return { progress, value }
}
