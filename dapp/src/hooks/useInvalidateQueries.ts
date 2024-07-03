import { logPromiseFailure } from "#/utils"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

type InvalidateQueriesParams = Parameters<QueryClient["invalidateQueries"]>

export default function useInvalidateQueries() {
  const queryClient = useQueryClient()

  return useCallback(
    (...params: InvalidateQueriesParams) =>
      logPromiseFailure(queryClient.invalidateQueries(...params)),
    [queryClient],
  )
}
