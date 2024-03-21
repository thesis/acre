import { useRef, useState, useEffect } from "react"
import { SizeType } from "#/types"

export function useSize() {
  const ref = useRef<HTMLDivElement>()
  const [size, setSize] = useState<SizeType>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: ref.current ? ref.current.clientWidth : 0,
        height: ref.current ? ref.current.clientHeight : 0,
      })
    }

    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return { ref, size }
}
