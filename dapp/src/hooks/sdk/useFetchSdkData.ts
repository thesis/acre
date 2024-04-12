import { useFetchBTCBalance } from "./useFetchBTCBalance"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"

export function useFetchSdkData() {
  useFetchBTCBalance()
  useFetchMinDepositAmount()
}
