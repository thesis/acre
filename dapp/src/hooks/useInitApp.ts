import { useEffect } from "react"
import { fetchBTCPriceUSD } from "#/store/btc"
import { asyncWrapper } from "#/utils"
import { useAppDispatch } from "./store"

export function useInitApp() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    asyncWrapper(dispatch(fetchBTCPriceUSD()))
  }, [dispatch])
}
