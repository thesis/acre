import React from "react"
import { Table as ChakraTable, TableContainer } from "@chakra-ui/react"
import { useTransactionHistoryTable } from "#/hooks"
import { StakeHistory } from "#/types"
import TableHeader from "./Header"
import TableBody from "./Body"
import { COLUMNS } from "./utils"
import TableFooter from "./Footer"

function Table({ data }: { data: StakeHistory[] }) {
  const table = useTransactionHistoryTable({
    data,
    columns: COLUMNS,
  })

  return (
    <>
      <TableContainer>
        <ChakraTable variant="double-row">
          <TableHeader table={table} />
          <TableBody table={table} />
        </ChakraTable>
      </TableContainer>
      <TableFooter table={table} />
    </>
  )
}

export default Table
