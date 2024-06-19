import { useEffect } from "react"
import { setTotalAssets } from "#/store/btc"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchTotalAssets() {
  const { acre, isInitialized } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isInitialized || !acre) return

    const fetchTotalAssets = async () => {
      const totalAssets = await acre.protocol.totalAssets()

      dispatch(setTotalAssets(totalAssets))
    }

    logPromiseFailure(fetchTotalAssets())
  }, [acre, dispatch, isInitialized])
}
