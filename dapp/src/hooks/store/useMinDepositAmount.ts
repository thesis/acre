import { selectMinDepositAmount } from "#/store/btc"
import { useAppSelector } from "./useAppSelector"

export function useMinDepositAmount() {
  return useAppSelector(selectMinDepositAmount)
}
