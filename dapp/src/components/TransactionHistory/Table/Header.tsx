import React from "react"
import { Thead, Tr, Th } from "@chakra-ui/react"
import { flexRender } from "@tanstack/react-table"
import { UseTransactionHistoryTableResult } from "#/types"

function TableHeader({ table }: { table: UseTransactionHistoryTableResult }) {
  return (
    <Thead>
      {table.getHeaderGroups().map(({ id, headers }) => (
        <Tr key={id}>
          {headers.map((header) => (
            <Th
              key={header.id}
              onClick={header.column.getToggleSortingHandler()}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  )
}

export default TableHeader
