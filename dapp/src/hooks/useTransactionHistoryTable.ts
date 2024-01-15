import {
  ColumnDef,
  PaginationState,
  Table,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { StakeHistory } from "#/types"
import { useState } from "react"

const PAGINATION_STATE = {
  pageIndex: 0,
  pageSize: 2,
}

export type UseTransactionHistoryTableResult = Table<StakeHistory>

export function useTransactionHistoryTable({
  data,
  columns,
}: {
  data: StakeHistory[]
  columns: ColumnDef<StakeHistory>[]
}): UseTransactionHistoryTableResult {
  const [pagination, setPagination] =
    useState<PaginationState>(PAGINATION_STATE)

  const table = useReactTable({
    columns,
    data,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
  })

  return table
}
