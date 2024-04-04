import { selectEstimatedBtcBalance } from "#/store/btc"
import { useAppSelector } from "./useAppSelector"

export function useEstimatedBTCBalance() {
  return useAppSelector(selectEstimatedBtcBalance)
}
