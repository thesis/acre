import { SEASON_CAP } from "#/constants"
import { useTotalAssets } from "./store"

export const useSeasonProgress = () => {
  const totalAssets = useTotalAssets()
  const progress = Math.floor(Number(totalAssets / SEASON_CAP) * 100)

  return { progress, totalAssets }
}
