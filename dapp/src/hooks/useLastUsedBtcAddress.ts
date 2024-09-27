import { useCallback } from "react"
import useLocalStorage from "./useLocalStorage"

export const LAST_USED_BTC_ADDRESS_KEY = "lastUsedBtcAddress"

export default function useLastUsedBtcAddress() {
  const [address, setAddress] = useLocalStorage<string | undefined>(
    LAST_USED_BTC_ADDRESS_KEY,
    undefined,
  )

  const setAddressInLocalStorage = useCallback(
    (btcAddress: string) => {
      setAddress(btcAddress)
    },
    [setAddress],
  )

  const removeAddressFromLocalStorage = useCallback(() => {
    setAddress(undefined)
  }, [setAddress])

  return {
    address,
    setAddressInLocalStorage,
    removeAddressFromLocalStorage,
  }
}
