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
      const minStakeAmount = await acre.staking.minStakeAmount()

      dispatch(setMinStakeAmount(minStakeAmount))
    }

    logPromiseFailure(fetchMinStakeAmount())
  }, [acre, dispatch, isInitialized])
}
