import { selectEstimatedDepositFee } from "#/store/btc"
import { useAppSelector } from "./useAppSelector"

export function useEstimatedDepositFee() {
  return useAppSelector(selectEstimatedDepositFee)
}
