import { useEffect } from "react"
import { useInterval } from "@chakra-ui/react"
import { ONE_MINUTE_IN_SECONDS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"
import { useFetchDeposits } from "./useFetchDeposits"
import { useWallet } from "../useWallet"

const INTERVAL_TIME = ONE_SEC_IN_MILLISECONDS * ONE_MINUTE_IN_SECONDS * 30

export function useInitDataFromSdk() {
  const { address } = useWallet()
  const fetchDeposits = useFetchDeposits()

  useEffect(() => {
    if (address) {
      logPromiseFailure(fetchDeposits())
    }
  }, [address, fetchDeposits])

  useFetchMinDepositAmount()
  useInterval(() => logPromiseFailure(fetchDeposits()), INTERVAL_TIME)
}
