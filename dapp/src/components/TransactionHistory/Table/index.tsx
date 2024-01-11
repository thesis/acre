import React from "react"
import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react"
import { flexRender } from "@tanstack/react-table"
import { useTransactionHistoryTable } from "../../../hooks"
import { StakeHistory } from "../../../types"
import { COLUMNS } from "./columns"

function Table({ data }: { data: StakeHistory[] }) {
  const table = useTransactionHistoryTable({
    data,
    columns: COLUMNS,
  })

  return (
    <ChakraTable variant="double-row">
      <Thead>
        {table.getHeaderGroups().map(({ id, headers }) => (
          <Tr key={id}>
            {headers.map((header) => (
              <Th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map(({ id, column, getContext }) => (
              <Td key={id}>
                {flexRender(column.columnDef.cell, getContext())}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </ChakraTable>
  )
}

export default Table
