import { useEffect } from "react"
import { setMinStakeAmount } from "#/store/btc"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchMinStakeAmount() {
  const { acre, isInitialized } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isInitialized || !acre) return

    const fetchMinStakeAmount = async () => {
      // TODO: Use function from SDK
      const minStakeAmount = await new Promise<bigint>((resolve) => {
        resolve(BigInt(String(1e4))) // 0.0001 BTC
      })

      dispatch(setMinStakeAmount(minStakeAmount))
    }

    logPromiseFailure(fetchMinStakeAmount())
  }, [acre, dispatch, isInitialized])
}
