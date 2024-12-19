import { selectMinDepositAmount } from "#/store/btc"
import useAppSelector from "./useAppSelector"

export default function useMinDepositAmount() {
  return useAppSelector(selectMinDepositAmount)
}
