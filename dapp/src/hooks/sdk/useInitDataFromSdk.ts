import { useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useWalletContext } from "../useWalletContext"
import { useFetchBTCBalance } from "./useFetchBTCBalance"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"
import { useFetchDeposits } from "./useFetchDeposits"

export function useInitDataFromSdk() {
  const { btcAccount } = useWalletContext()
  const fetchDeposits = useFetchDeposits()

  useFetchBTCBalance()
  useFetchMinDepositAmount()

  useEffect(() => {
    if (btcAccount) {
      logPromiseFailure(fetchDeposits())
    }
  }, [btcAccount, fetchDeposits])
}
