import React from "react"
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Icon,
  Text,
  IconButton,
  VStack,
} from "@chakra-ui/react"
import {
  flexRender,
  ColumnDef,
  SortDirection,
  createColumnHelper,
} from "@tanstack/react-table"
import { useTransactionHistoryTable } from "../../../hooks"
import { TxHistory } from "../../../types"
import { getCustomCell } from "./CustomCell"
import { formatBlockTImestamp, truncateAddress } from "../../../utils"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Sort,
} from "../../../static/icons"

const getSortIcon = (value: false | SortDirection) => {
  if (value) return value === "desc" ? ArrowDown : ArrowUp
  return Sort
}

const columnHelper = createColumnHelper<TxHistory>()
// When defining the columns for the table, columnHelper.accessor  ts returns a type issue.
// Let's use the type any ay to avoid this error for this moment.
// More info: https://github.com/TanStack/table/issues/4241
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COLUMNS: ColumnDef<TxHistory, any>[] = [
  // To enable the sorting of some columns let's use `columnHelper.accessor`.
  // To do this, we also need to provide a key to the variable.
  // Let's sort the data by the first transaction.
  columnHelper.accessor("callTx.timestamp", {
    header: "Date",
    cell: ({ row: { original } }) =>
      getCustomCell(
        "text",
        formatBlockTImestamp(original.callTx.timestamp),
        formatBlockTImestamp(original.receiptTx.timestamp),
      ),
  }),
  columnHelper.display({
    header: "action",
    cell: ({ row: { original } }) =>
      getCustomCell("text", original.callTx.action, original.receiptTx.action),
  }),
  columnHelper.display({
    header: "Asset",
    cell: ({ row: { original } }) =>
      getCustomCell("asset", original.callTx.asset, original.receiptTx.asset),
  }),
  columnHelper.accessor("callTx.amount", {
    cell: ({ row: { original } }) =>
      // TOTO:Use the correct format for the amounts
      getCustomCell(
        "text",
        original.callTx.amount.toString(),
        original.receiptTx.amount.toString(),
      ),
    header: "Amount",
  }),
  columnHelper.display({
    header: "Account",
    cell: ({ row: { original } }) =>
      getCustomCell(
        "text",
        truncateAddress(original.callTx.account),
        truncateAddress(original.receiptTx.account),
      ),
  }),
  columnHelper.display({
    header: "Transaction",
    cell: ({ row: { original } }) =>
      getCustomCell("link", original.callTx.txHash, original.receiptTx.txHash),
  }),
  columnHelper.display({
    header: "Status",
    cell: ({ row: { original } }) =>
      getCustomCell("text", original.callTx.status, original.receiptTx.status),
  }),
]

export default function DataTable({ data }: { data: TxHistory[] }) {
  const table = useTransactionHistoryTable({
    data,
    columns: COLUMNS,
  })

  return (
    <VStack alignItems="start">
      <Table>
        <Thead backgroundColor="transparent">
          {table.getHeaderGroups().map(({ id, headers }) => (
            <Tr key={id}>
              {headers.map((header) => (
                <Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  borderBottom={0}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {header.column.getCanSort() && (
                    <Icon
                      as={getSortIcon(header.column.getIsSorted())}
                      ml={1}
                    />
                  )}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id} border="2px solid #F4E4C1">
              {row.getVisibleCells().map(({ id, column, getContext }) => (
                <Td key={id} p={0}>
                  {flexRender(column.columnDef.cell, getContext())}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack>
        <IconButton
          aria-label="Previous Page"
          onClick={() => table.previousPage()}
          isDisabled={!table.getCanPreviousPage()}
          icon={<ChevronLeft />}
        />
        <IconButton
          aria-label="Next page"
          variant="outline"
          onClick={() => table.nextPage()}
          isDisabled={!table.getCanNextPage()}
          icon={<ChevronRight />}
        />
        <Text>
          {`Page ${
            table.getState().pagination.pageIndex + 1
          } of ${table.getPageCount()}`}
        </Text>
      </HStack>
    </VStack>
  )
}
