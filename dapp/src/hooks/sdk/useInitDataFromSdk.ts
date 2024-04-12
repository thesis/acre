import { useFetchBTCBalance } from "./useFetchBTCBalance"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"

export function useInitDataFromSdk() {
  useFetchBTCBalance()
  useFetchMinDepositAmount()
}
