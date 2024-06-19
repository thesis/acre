import { selectTotalAssets } from "#/store/btc"
import { useAppSelector } from "./useAppSelector"

export function useTotalAssets() {
  return useAppSelector(selectTotalAssets)
}
