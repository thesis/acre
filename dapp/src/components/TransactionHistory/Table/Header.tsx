import React from "react"
import { Thead, Tr, Th, Icon, useMultiStyleConfig, Box } from "@chakra-ui/react"
import { flexRender } from "@tanstack/react-table"
import { UseTransactionHistoryTableResult } from "#/types"
import { SORT_ICONS } from "./utils"

function TableHeader({ table }: { table: UseTransactionHistoryTableResult }) {
  const styles = useMultiStyleConfig("Table")

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
              <Box
                __css={styles.header}
                style={{
                  ...(column.getCanSort() && { cursor: "pointer" }),
                }}
              >
                {flexRender(column.columnDef.header, getContext())}
                {column.getCanSort() && (
                  <Box __css={styles.sortContainer}>
                    {SORT_ICONS.map(({ key, icon, getColor, boxSize }) => (
                      <Icon
                        key={key}
                        as={icon}
                        boxSize={boxSize}
                        color={getColor(column.getIsSorted())}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  )
}

export default TableHeader
