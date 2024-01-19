import React from "react"
import { Tr, Tbody, Td } from "@chakra-ui/react"
import { flexRender } from "@tanstack/react-table"
import { UseTransactionHistoryTableResult } from "#/types"

function TableBody({ table }: { table: UseTransactionHistoryTableResult }) {
  return (
    <Tbody>
      {table.getRowModel().rows.map((row) => (
        <Tr key={row.id}>
          {row.getVisibleCells().map(({ id, column, getContext }) => (
            <Td key={id}>{flexRender(column.columnDef.cell, getContext())}</Td>
          ))}
        </Tr>
      ))}
    </Tbody>
  )
}

export default TableBody
