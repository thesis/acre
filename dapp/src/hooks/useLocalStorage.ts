import { useLocalStorage as useRehooksLocalStorage } from "@rehooks/local-storage"

export const getLocalStorageItem = (key: string): string | undefined => {
  const value = localStorage.getItem(key)
  if (value === "undefined" || value === "null" || value === null)
    return undefined

  return value
}

export default function useLocalStorage<T>(key: string, defaultValue: T) {
  return useRehooksLocalStorage(key, defaultValue)
}
