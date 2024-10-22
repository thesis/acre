import { useCallback } from "react"
import useLocalStorage from "./useLocalStorage"

export default function useAccessCode() {
  const [accessCode, setAccessCode] = useLocalStorage<string | undefined>(
    "acre.accessCode",
    undefined,
  )

  const saveAccessCode = useCallback(
    (value: string) => {
      const encodedCode = window.btoa(value)
      setAccessCode(encodedCode)
    },
    [setAccessCode],
  )

  return { encodedCode: accessCode, saveAccessCode }
}
