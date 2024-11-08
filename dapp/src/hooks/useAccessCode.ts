import { useCallback } from "react"
import useLocalStorage, { getLocalStorageItem } from "./useLocalStorage"

const LOCAL_STORAGE_KEY = "acre.accessCode"

export function getAccessCodeFromLocalStorage() {
  return getLocalStorageItem(LOCAL_STORAGE_KEY)
}
export default function useAccessCode() {
  const [encodedCode, setAccessCode] = useLocalStorage<string | undefined>(
    LOCAL_STORAGE_KEY,
    undefined,
  )

  const saveAccessCode = useCallback(
    (value: string) => {
      setAccessCode(window.btoa(value))
    },
    [setAccessCode],
  )

  return { encodedCode, saveAccessCode }
}
