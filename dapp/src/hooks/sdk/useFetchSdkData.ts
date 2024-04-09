import { useFetchBTCBalance } from "./useFetchBTCBalance"
import { useFetchMinStakeAmount } from "./useFetchMinStakeAmount"

export function useFetchSdkData() {
  useFetchBTCBalance()
  useFetchMinStakeAmount()
}
