import { useEffect } from "react"
import { useInterval } from "@chakra-ui/react"
import { logPromiseFailure } from "#/utils"
import { INTERVAL_TIME_IN_MILLISECONDS } from "#/constants"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"
import { useFetchDeposits } from "./useFetchDeposits"
import { useWallet } from "../useWallet"

export function useInitDataFromSdk() {
  const { address } = useWallet()
  const fetchDeposits = useFetchDeposits()

  useEffect(() => {
    if (address) {
      logPromiseFailure(fetchDeposits())
    }
  }, [address, fetchDeposits])

  useFetchMinDepositAmount()
  useInterval(
    () => logPromiseFailure(fetchDeposits()),
    INTERVAL_TIME_IN_MILLISECONDS,
  )
}
