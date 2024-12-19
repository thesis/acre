import { QueryFilters, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { resetState } from "#/store/wallet"
import { queryKeysFactory } from "#/constants"
import { logPromiseFailure } from "#/utils"
import useAppDispatch from "./store/useAppDispatch"

const { userKeys } = queryKeysFactory

export default function useResetWalletState() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  const resetQueries = useCallback(async () => {
    const filters: QueryFilters = { queryKey: userKeys.all, exact: true }

    queryClient.removeQueries(filters)
    await queryClient.resetQueries(filters)
  }, [queryClient])

  return useCallback(() => {
    dispatch(resetState())
    logPromiseFailure(resetQueries())
  }, [dispatch, resetQueries])
}
