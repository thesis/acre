import {
  ColumnDef,
  PaginationState,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { StakeHistory, UseTransactionHistoryTableResult } from "#/types"
import { useState } from "react"

const PAGINATION_STATE = {
  pageIndex: 0,
  pageSize: 10,
}

export function useTransactionHistoryTable({
  data,
  columns,
}: {
  data: StakeHistory[]
  columns: ColumnDef<StakeHistory>[]
}): UseTransactionHistoryTableResult {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] =
    useState<PaginationState>(PAGINATION_STATE)

  const table = useReactTable({
    columns,
    data,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
  })

  return table
}
