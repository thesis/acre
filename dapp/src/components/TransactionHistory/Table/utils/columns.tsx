import React from "react"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { StakeHistory } from "#/types"
import { capitalize, truncateAddress } from "#/utils"
import CustomCell from "../Cell/Custom"
import Cell from "../Cell"
import SimpleText from "../Cell/components/SimpleText"

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
    size: 100,
    cell: ({ row: { original } }) => (
      <CustomCell
        type="date"
        firstTransaction={original.callTx}
        secondTransaction={original.receiptTx}
      />
    ),
  }),
  columnHelper.display({
    header: "Action",
    cell: ({ row: { original } }) => (
      <Cell
        firstField={
          <SimpleText>{capitalize(original.callTx.action)}</SimpleText>
        }
        secondField={
          <SimpleText>{capitalize(original.receiptTx.action)}</SimpleText>
        }
      />
    ),
  }),
  columnHelper.display({
    header: "Asset",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="currency-icon"
        firstTransaction={original.callTx}
        secondTransaction={original.receiptTx}
      />
    ),
  }),
  columnHelper.accessor("callTx.asset.amount", {
    header: "Amount",
    cell: ({ row: { original } }) => (
      <CustomCell
        type="currency-balance"
        firstTransaction={original.callTx}
        secondTransaction={original.receiptTx}
      />
    ),
  }),
  columnHelper.display({
    header: "Account",
    size: 250,
    cell: ({ row: { original } }) => (
      <Cell
        firstField={
          <SimpleText>{truncateAddress(original.callTx.account)}</SimpleText>
        }
        secondField={
          <SimpleText>{truncateAddress(original.receiptTx.account)}</SimpleText>
        }
      />
    ),
  }),
  columnHelper.display({
    header: "Transaction",
    size: 250,
    cell: ({ row: { original } }) => (
      <CustomCell
        type="block-explorer"
        firstTransaction={original.callTx}
        secondTransaction={original.receiptTx}
      />
    ),
  }),
  columnHelper.display({
    header: "Status",
    meta: {
      style: { textAlign: "right" },
    },
    cell: ({ row: { original } }) => (
      <CustomCell
        type="status"
        firstTransaction={original.callTx}
        secondTransaction={original.receiptTx}
      />
    ),
  }),
]
