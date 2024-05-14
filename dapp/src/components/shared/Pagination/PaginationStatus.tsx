import React from "react"
import { TextProps } from "@chakra-ui/react"
import { usePagination } from "../../../contexts/PaginationContext"
import { TextSm } from "../Typography"

type PaginationStatusProps = TextProps & {
  dataLabel?: string
}

function PaginationStatus(props: PaginationStatusProps) {
  const { dataLabel = "items", ...restProps } = props
  const { page, pageSize, totalSize } = usePagination()

  const rangeStart = page * pageSize + 1 // Pages are indexed from 0
  const rangeEnd = Math.min(rangeStart + pageSize - 1, totalSize)

  return (
    <TextSm {...restProps}>
      Showing {rangeStart}-{rangeEnd} out of {totalSize} {dataLabel}
    </TextSm>
  )
}

export default PaginationStatus
