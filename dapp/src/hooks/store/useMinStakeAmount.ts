import { selectMinStakeAmount } from "#/store/btc"
import { useAppSelector } from "./useAppSelector"

export function useMinStakeAmount() {
  return useAppSelector(selectMinStakeAmount)
}
