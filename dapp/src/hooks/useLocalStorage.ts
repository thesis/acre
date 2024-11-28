import {
  useLocalStorage as useRehooksLocalStorage,
  writeStorage,
} from "@rehooks/local-storage"

export const parseLocalStorageValue = (value: string | null | undefined) => {
  if (
    value === "undefined" ||
    value === "null" ||
    value === null ||
    value === undefined
  )
    return undefined

  return value
}

export { writeStorage }

export const getLocalStorageItem = (key: string): string | undefined => {
  const value = localStorage.getItem(key)
  return parseLocalStorageValue(value)
}

export default function useLocalStorage<T>(key: string, defaultValue: T) {
  return useRehooksLocalStorage(key, defaultValue)
}
