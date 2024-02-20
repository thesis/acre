import { useEffect } from "react"
import { fetchBTCPriceUSD } from "#/store/btc/btc.thunk"
import { asyncWrapper } from "#/utils"
import { useAppDispatch } from "./useAppDispatch"

export function useInitApp() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    asyncWrapper(dispatch(fetchBTCPriceUSD()))
  }, [dispatch])
}
