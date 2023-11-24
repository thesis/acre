import { useState } from "react"
import {
  ColumnDef,
  SortingState,
  PaginationState,
  Table,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { TxHistory } from "../types"

type TransactionHistoryTable = {
  data: TxHistory[]
  columns: ColumnDef<TxHistory>[]
}

export function useTransactionHistoryTable({
  data,
  columns,
}: TransactionHistoryTable): Table<TxHistory> {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 4,
  })

  const table = useReactTable({
    columns,
    data,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
  })

  return table
}
