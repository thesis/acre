import React from "react"
import { TextProps } from "@chakra-ui/react"
import { TextSm } from "../Typography"

const MOCK_PAGE_SIZE = 10
const MOCK_PAGE = 2
const MOCK_TOTAL_SIZE = 27

function PaginationStatus(props: TextProps) {
  const rangeStart = MOCK_PAGE * MOCK_PAGE_SIZE + 1 // Pages are indexed from 0
  const rangeEnd = Math.min(rangeStart + MOCK_PAGE_SIZE - 1, MOCK_TOTAL_SIZE)

  return (
    <TextSm {...props}>
      Showing {rangeStart}-{rangeEnd} out of {MOCK_TOTAL_SIZE} transactions
    </TextSm>
  )
}

export default PaginationStatus
