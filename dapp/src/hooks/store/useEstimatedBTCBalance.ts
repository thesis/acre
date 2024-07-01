import { selectEstimatedBtcBalance } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useEstimatedBTCBalance() {
  return useAppSelector(selectEstimatedBtcBalance)
}
