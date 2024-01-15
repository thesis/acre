import React from "react"
import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  IconButton,
} from "@chakra-ui/react"
import { flexRender } from "@tanstack/react-table"
import { useTransactionHistoryTable } from "#/hooks"
import { StakeHistory } from "#/types"
import { TextSm } from "#/components/shared/Typography"
import { COLUMNS } from "./columns"
import { PAGINATION_BUTTONS } from "./pagination"

function Table({ data }: { data: StakeHistory[] }) {
  const table = useTransactionHistoryTable({
    data,
    columns: COLUMNS,
  })

  return (
    <>
      <TableContainer>
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
      </TableContainer>
      <HStack mt={6}>
        {PAGINATION_BUTTONS.map(({ ariaLabel, onClick, isDisabled, icon }) => (
          <IconButton
            key={ariaLabel}
            variant="pagination"
            aria-label={ariaLabel}
            onClick={() => onClick(table)}
            isDisabled={isDisabled(table)}
            icon={icon}
          />
        ))}
        <TextSm>
          {`Page ${
            table.getState().pagination.pageIndex + 1
          } of ${table.getPageCount()}`}
        </TextSm>
      </HStack>
    </>
  )
}

export default Table
