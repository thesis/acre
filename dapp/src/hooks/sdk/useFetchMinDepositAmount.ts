import { useEffect } from "react"
import { setMinDepositAmount } from "#/store/btc"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import useAppDispatch from "../store/useAppDispatch"

export default function useFetchMinDepositAmount() {
  const { acre, isInitialized } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isInitialized || !acre) return

    const fetchMinDepositAmount = async () => {
      const minDepositAmount = await acre.protocol.minimumDepositAmount()

      dispatch(setMinDepositAmount(minDepositAmount))
    }

    logPromiseFailure(fetchMinDepositAmount())
  }, [acre, dispatch, isInitialized])
}
