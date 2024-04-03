import { useRef, useState, useEffect } from "react"
import { SizeType } from "#/types"

const initialSize = {
  width: 0,
  height: 0,
}

export function useSize() {
  const ref = useRef<HTMLDivElement>()
  const [size, setSize] = useState<SizeType>(initialSize)

  useEffect(() => {
    const onResize = () => {
      const newSize = ref.current
        ? {
            width: ref.current.clientWidth,
            height: ref.current.clientHeight,
          }
        : initialSize

      setSize(newSize)
    }

    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return { ref, size }
}
