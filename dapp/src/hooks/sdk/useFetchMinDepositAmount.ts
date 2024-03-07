import { useEffect } from "react"
import { setMinDepositAmount } from "#/store/btc"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchMinDepositAmount() {
  const { acre, isInitialized } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isInitialized || !acre) return

    const fetchMinDepositAmount = async () => {
      // TODO: Use function from SDK
      const minDepositAmount = await new Promise<bigint>((resolve) => {
        resolve(BigInt(String(1e4))) // 0.0001 BTC
      })

      dispatch(setMinDepositAmount(minDepositAmount))
    }

    logPromiseFailure(fetchMinDepositAmount())
  }, [acre, dispatch, isInitialized])
}
