import React from "react"
import { Thead, Tr, Th } from "@chakra-ui/react"
import { flexRender } from "@tanstack/react-table"
import { UseTransactionHistoryTableResult } from "#/types"

function TableHeader({ table }: { table: UseTransactionHistoryTableResult }) {
  return (
    <Thead>
      {table.getHeaderGroups().map(({ id, headers }) => (
        <Tr key={id}>
          {headers.map(({ id: headerId, column, getContext }) => (
            <Th
              key={headerId}
              onClick={column.getToggleSortingHandler()}
              textAlign={column.columnDef.meta?.style.textAlign}
            >
              {flexRender(column.columnDef.header, getContext())}
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  )
}

export default TableHeader
