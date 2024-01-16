import React from "react"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { StakeHistory } from "#/types"
import { truncateAddress } from "#/utils"
import CustomCell from "./CustomCell"

const columnHelper = createColumnHelper<StakeHistory>()
// When defining the columns for the table, columnHelper.accessor  ts returns a type issue.
// Let's use the type any ay to avoid this error for this moment.
// More info: https://github.com/TanStack/table/issues/4241
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const COLUMNS: ColumnDef<StakeHistory, any>[] = [
  // To enable the sorting of some columns let's use `columnHelper.accessor`.
  // To do this, we also need to provide a key to the variable.
  // More info: https://tanstack.com/table/v8/docs/guide/column-defs#column-def-types
  // Let's sort the data by the first transaction.
  columnHelper.accessor("callTx.timestamp", {
    header: "Date",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="text"
        value1={original.callTx.timestamp.toString()}
        value2={original.receiptTx.timestamp.toString()}
      />
    ),
  }),
  columnHelper.display({
    header: "Action",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="text"
        value1={original.callTx.action}
        value2={original.receiptTx.action}
      />
    ),
  }),
  columnHelper.display({
    header: "Asset",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="text"
        value1={original.callTx.asset}
        value2={original.receiptTx.asset}
      />
    ),
  }),
  columnHelper.accessor("callTx.amount", {
    header: "Amount",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="text"
        value1={original.callTx.amount.toString()}
        value2={original.receiptTx.amount.toString()}
      />
    ),
  }),
  columnHelper.display({
    header: "Account",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="text"
        value1={truncateAddress(original.callTx.account)}
        value2={truncateAddress(original.receiptTx.account)}
      />
    ),
  }),
  columnHelper.display({
    header: "Transaction",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="block-explorer"
        value1={original.callTx.txHash}
        value2={original.receiptTx.txHash}
      />
    ),
  }),
  columnHelper.display({
    header: "Status",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="text"
        value1={original.callTx.status.toString()}
        value2={original.receiptTx.status.toString()}
      />
    ),
  }),
]
