import { useEffect } from "react"
import { fetchBTCPriceUSD } from "#/store/btc"
import { logPromiseFailure } from "#/utils"
import { useAppDispatch } from "./store"

export default function useFetchBTCPriceUSD() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    logPromiseFailure(dispatch(fetchBTCPriceUSD()))
  }, [dispatch])
}
