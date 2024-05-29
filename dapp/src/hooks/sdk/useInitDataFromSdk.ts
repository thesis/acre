import { useEffect } from "react"
import { useInterval } from "@chakra-ui/react"
import { ONE_MINUTE_IN_SECONDS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useWalletContext } from "../useWalletContext"
import { useFetchBTCBalance } from "./useFetchBTCBalance"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"
import { useFetchDeposits } from "./useFetchDeposits"

const INTERVAL_TIME = ONE_SEC_IN_MILLISECONDS * ONE_MINUTE_IN_SECONDS * 30

export function useInitDataFromSdk() {
  const { btcAccount } = useWalletContext()
  const fetchDeposits = useFetchDeposits()

  useEffect(() => {
    if (btcAccount) {
      logPromiseFailure(fetchDeposits())
    }
  }, [btcAccount, fetchDeposits])

  useFetchBTCBalance()
  useFetchMinDepositAmount()
  useInterval(() => logPromiseFailure(fetchDeposits()), INTERVAL_TIME)
}
