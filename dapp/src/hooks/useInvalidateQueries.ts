import { logPromiseFailure } from "#/utils"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

type InvalidateQueriesParams = Parameters<QueryClient["invalidateQueries"]>

export default function useInvalidateQueries(
  ...params: InvalidateQueriesParams
) {
  const queryClient = useQueryClient()

  return useCallback(
    () => logPromiseFailure(queryClient.invalidateQueries(...params)),
    [params, queryClient],
  )
}
