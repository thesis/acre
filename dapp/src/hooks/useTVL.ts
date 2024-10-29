import { TOTAL_VALUE_LOCKED_CAP } from "#/constants"
import useTotalAssets from "./sdk/useTotalAssets"

export const useTVL = () => {
  const { data } = useTotalAssets()

  const totalAssets = data ?? 0n
  const dividingResult =
    Number((totalAssets * 100n * 100n) / TOTAL_VALUE_LOCKED_CAP) / (100 * 100)
  // Doubled factor to get more precision

  const isCapExceeded = totalAssets > TOTAL_VALUE_LOCKED_CAP

  const progress = Math.floor(isCapExceeded ? 100 : dividingResult * 100)
  const value = isCapExceeded ? TOTAL_VALUE_LOCKED_CAP : totalAssets

  return { progress, value, isCapExceeded }
}
