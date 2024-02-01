import React from "react"
import { UseTransactionHistoryTableResult } from "#/types"
import { ArrowLeft, ArrowRight } from "#/assets/icons"

export const PAGINATION_BUTTONS = [
  {
    icon: <ArrowLeft />,
    ariaLabel: "Previous Page",
    onClick: (table: UseTransactionHistoryTableResult) => table.previousPage(),
    isDisabled: (table: UseTransactionHistoryTableResult) =>
      !table.getCanPreviousPage(),
  },
  {
    icon: <ArrowRight />,
    ariaLabel: "Next Page",
    onClick: (table: UseTransactionHistoryTableResult) => table.nextPage(),
    isDisabled: (table: UseTransactionHistoryTableResult) =>
      !table.getCanNextPage(),
  },
]

export const getPaginationState = (
  pageIndex: number,
  pageSize: number,
  rowCount: number,
) => {
  const rowMin = pageIndex * pageSize + 1
  const rowMax = Math.min((pageIndex + 1) * pageSize, rowCount)

  return { rowMin, rowMax }
}
