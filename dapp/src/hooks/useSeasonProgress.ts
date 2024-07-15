import { SEASON_CAP } from "#/constants"
import useTotalAssets from "./sdk/useTotalAssets"

export const useSeasonProgress = () => {
  const { data } = useTotalAssets()

  const totalAssets = data ?? 0n
  const dividingResult =
    Number((totalAssets * 100n * 100n) / SEASON_CAP) / (100 * 100)
  // Doubled factor to get more precision

  const isSeasonCapExceeded = totalAssets > SEASON_CAP

  let progress = isSeasonCapExceeded ? 100 : dividingResult * 100
  const value = isSeasonCapExceeded ? SEASON_CAP : totalAssets

  if (progress < 1) {
    progress = Number(progress.toFixed(2))
  } else {
    progress = Math.floor(progress)
  }

  return { progress, value }
}
