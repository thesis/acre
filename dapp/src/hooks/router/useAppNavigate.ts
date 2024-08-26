import { Pathname } from "#/router/path"
import { useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function useAppNavigate() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  return useCallback(
    (pathname: Pathname) => {
      navigate({
        pathname,
        search: searchParams.toString(),
      })
    },
    [navigate, searchParams],
  )
}
