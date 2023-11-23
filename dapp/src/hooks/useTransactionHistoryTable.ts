import { useState } from "react"
import {
  ColumnDef,
  SortingState,
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
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
  })

  return table
}
