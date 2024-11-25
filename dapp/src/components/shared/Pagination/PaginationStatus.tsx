import React from "react"
import { TextProps } from "@chakra-ui/react"
import { usePagination } from "#/hooks"
import { TextSm } from "../Typography"

// TODO: move to top level `utils` directory
const getPaginationState = (
  pageIndex: number,
  pageSize: number,
  rowCount: number,
) => {
  const rowMin = pageIndex * pageSize + 1
  const rowMax = Math.min((pageIndex + 1) * pageSize, rowCount)

  return { rowMin, rowMax }
}

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
      {rangeStart}-{rangeEnd} out of {totalSize} {dataLabel}
    </TextSm>
  )
}

export default PaginationStatus
