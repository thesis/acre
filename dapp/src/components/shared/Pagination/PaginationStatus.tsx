import React from "react"
import { TextProps } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { TextSm } from "../Typography"
import { usePagination } from "./PaginationContext"

function PaginationStatus(props: TextProps) {
  const { currentPage, pageSize, totalSize, dataLabel } = usePagination()

  const rangeStart = currentPage * pageSize + 1 // Pages are indexed from 0
  const rangeEnd = Math.min(rangeStart + pageSize - 1, totalSize)

  return (
    <TextSm
      as={motion.p}
      // @ts-expect-error - Chakra doesn't capture Framer Motion props definition properly
      layout="position"
      {...props}
    >
      Showing {rangeStart}-{rangeEnd} out of {totalSize} {dataLabel}
    </TextSm>
  )
}

export default PaginationStatus
