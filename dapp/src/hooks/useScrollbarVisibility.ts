import { useCallback, useEffect, useState } from "react"

const SCROLLBAR_WIDTH = `${window.innerWidth - document.body.offsetWidth}px`

function isScrollbarVisible(className: string) {
  const element = document.getElementsByClassName(className)[0]
  return element?.scrollHeight > element?.clientHeight
}

export default function useScrollbarVisibility(className: string) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(isScrollbarVisible(className))
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [className])

  const refetch = useCallback(() => {
    setIsVisible(isScrollbarVisible(className))
  }, [className])

  return { isVisible, scrollbarWidth: SCROLLBAR_WIDTH, refetch }
}
