import { useCallback, useRef } from "react"

/**
 * Debounce a function
 * @param callback The function to debounce
 * @param delay The delay in ms
 * @returns A debounced function
 */
export default function useDebounce(callback: VoidFunction, delay = 250) {
  const latestTimeout = useRef<NodeJS.Timeout>()

  const memoizedCallback = useCallback(callback, [callback])

  return () => {
    if (latestTimeout.current) {
      clearTimeout(latestTimeout.current)
    }

    latestTimeout.current = setTimeout(() => {
      memoizedCallback()
    }, delay)
  }
}
