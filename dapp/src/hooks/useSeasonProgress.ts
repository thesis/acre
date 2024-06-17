import { SEASON_CAP } from "#/constants"
import { useTotalAssets } from "./store"

export const useSeasonProgress = () => {
  const totalAssets = useTotalAssets()
  const dividingResult = Number((totalAssets * 100n) / SEASON_CAP) / 100
  const progress = Math.floor(dividingResult * 100)

  return { progress, totalAssets }
}
