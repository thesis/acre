import React from "react"
import { UseTransactionHistoryTableResult } from "#/types"
import { HStack, IconButton } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { PAGINATION_BUTTONS } from "./utils/pagination"

function TableFooter({ table }: { table: UseTransactionHistoryTableResult }) {
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
        {`Page ${
          table.getState().pagination.pageIndex + 1
        } of ${table.getPageCount()}`}
      </TextSm>
    </HStack>
  )
}

export default TableFooter
