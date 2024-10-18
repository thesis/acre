import { useCallback, useEffect, useState } from "react"

const SCROLLBAR_WIDTH = `${window.innerWidth - document.body.offsetWidth}px`

function isScrollbarVisible(selector: string) {
  const element = document.querySelector(selector)

  if (!element) return false

  return element?.scrollHeight > element?.clientHeight
}

export default function useScrollbarVisibility(selector: string) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(isScrollbarVisible(selector))
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [selector])

  const refetch = useCallback(() => {
    setIsVisible(isScrollbarVisible(selector))
  }, [selector])

  return { isVisible, scrollbarWidth: SCROLLBAR_WIDTH, refetch }
}
