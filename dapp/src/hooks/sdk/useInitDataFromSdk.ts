import { useEffect } from "react"
import { useInterval } from "@chakra-ui/react"
import { logPromiseFailure } from "#/utils"
import { REFETCH_INTERVAL_IN_MILLISECONDS } from "#/constants"
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
    REFETCH_INTERVAL_IN_MILLISECONDS,
  )
}
