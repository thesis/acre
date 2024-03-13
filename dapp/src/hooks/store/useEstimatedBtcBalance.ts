import { selectEstimatedBtcBalance } from "#/store/btc"
import { useAppSelector } from "./useAppSelector"

export function useEstimatedBtcBalance() {
  return useAppSelector(selectEstimatedBtcBalance)
}
