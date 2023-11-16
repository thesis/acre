import { useEffect, useState } from "react"

const setLocalStorageItem = (key: string, value: string): void =>
  localStorage.setItem(key, value)

const getLocalStorageItem = (key: string, defaultValue: string): string =>
  localStorage.getItem(key) || defaultValue

export function useLocalStorage(
  key: string,
  initialValue: string,
): [string, React.Dispatch<React.SetStateAction<string>>] {
  const [value, setValue] = useState(() =>
    getLocalStorageItem(key, initialValue),
  )
  const [cachedKey, setCachedKey] = useState(key)

  useEffect(() => {
    if (key !== cachedKey) {
      setValue(getLocalStorageItem(key, initialValue))
      setCachedKey(key)
    }
  }, [key, cachedKey, initialValue])

  useEffect(() => {
    setLocalStorageItem(cachedKey, value)
  }, [cachedKey, value])

  return [value, setValue]
}
