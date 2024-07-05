import { SEASON_CAP } from "#/constants"
import useTotalAssets from "./sdk/useTotalAssets"

export const useSeasonProgress = () => {
  const { data } = useTotalAssets()

  const totalAssets = data ?? 0n
  const dividingResult = Number((totalAssets * 100n) / SEASON_CAP) / 100

  const isSeasonCapExceeded = totalAssets > SEASON_CAP

  const progress = isSeasonCapExceeded ? 100 : Math.floor(dividingResult * 100)
  const value = isSeasonCapExceeded ? SEASON_CAP : totalAssets

  return { progress, value }
}
