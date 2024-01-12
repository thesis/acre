import {
  ColumnDef,
  Table,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { StakeHistory } from "#/types"

type UseTransactionHistoryTableResult = Table<StakeHistory>

export function useTransactionHistoryTable({
  data,
  columns,
}: {
  data: StakeHistory[]
  columns: ColumnDef<StakeHistory>[]
}): UseTransactionHistoryTableResult {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  return table
}
