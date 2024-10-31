import { useCallback } from "react"
import useLocalStorage from "./useLocalStorage"

export default function useAccessCode() {
  const [encodedCode, setAccessCode] = useLocalStorage<string | undefined>(
    "acre.accessCode",
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
