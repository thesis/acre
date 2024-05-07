import React from "react"
import { TextProps } from "@chakra-ui/react"
import { TextSm } from "../Typography"
import { usePagination } from "./PaginationContext"

function PaginationStatus(props: TextProps) {
  const { page, pageSize, totalSize } = usePagination()

  const rangeStart = page * pageSize + 1 // Pages are indexed from 0
  const rangeEnd = Math.min(rangeStart + pageSize - 1, totalSize)

  return (
    <TextSm {...props}>
      Showing {rangeStart}-{rangeEnd} out of {totalSize} transactions
    </TextSm>
  )
}

export default PaginationStatus
