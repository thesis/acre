import React from "react"
import { TextProps } from "@chakra-ui/react"
import { getPaginationState } from "#/components/TransactionHistory/Table/utils"
import { usePagination } from "#/hooks"
import { TextSm } from "../Typography"

type PaginationStatusProps = TextProps & {
  dataLabel?: string
}

function PaginationStatus(props: PaginationStatusProps) {
  const { dataLabel = "items", ...restProps } = props
  const { page, pageSize, totalSize } = usePagination()

  const { rowMin: rangeStart, rowMax: rangeEnd } = getPaginationState(
    page,
    pageSize,
    totalSize,
  )

  return (
    <TextSm {...restProps}>
      Showing {rangeStart}-{rangeEnd} out of {totalSize} {dataLabel}
    </TextSm>
  )
}

export default PaginationStatus
