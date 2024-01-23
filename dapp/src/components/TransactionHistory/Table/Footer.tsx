import React from "react"
import { UseTransactionHistoryTableResult } from "#/types"
import { HStack, IconButton } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { PAGINATION_BUTTONS, getPaginationState } from "./utils/pagination"

function TableFooter({ table }: { table: UseTransactionHistoryTableResult }) {
  const { pageIndex, pageSize } = table.getState().pagination
  const rowCount = table.getFilteredRowModel().rows.length
  const { rowMin, rowMax } = getPaginationState(pageIndex, pageSize, rowCount)

  return (
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
        {`Showing ${rowMin}-${rowMax} out of ${rowCount} transactions`}
      </TextSm>
    </HStack>
  )
}

export default TableFooter
