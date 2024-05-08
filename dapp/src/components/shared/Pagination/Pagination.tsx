import React from "react"
import { StackProps, VStack } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { PaginationContext } from "./PaginationContext"

export type PaginationProps<T> = Omit<StackProps, "as"> & {
  data: T[]
  pageSize?: number
  defaultPage?: number
  dataLabel?: string
}

export function Pagination<T>(props: PaginationProps<T>) {
  const {
    data,
    children,
    pageSize = 10,
    defaultPage = 3,
    dataLabel = "items",
    ...restProps
  } = props

  const [currentPage, setCurrentPage] = React.useState(defaultPage)
  const [direction, setDirection] = React.useState<"left" | "right">("right")

  const handleSetPage = React.useCallback(
    (newPage: number) => {
      setDirection(newPage > currentPage ? "right" : "left")
      setCurrentPage(newPage)
    },
    [currentPage],
  )

  const pageData = React.useMemo(
    () => data.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
    [data, currentPage, pageSize],
  )

  const contextValue = React.useMemo(
    () => ({
      pageSize,
      currentPage,
      direction,
      setPage: handleSetPage,
      totalSize: data.length,
      dataLabel,
      pageData,
    }),
    [
      pageSize,
      currentPage,
      data,
      dataLabel,
      direction,
      handleSetPage,
      pageData,
    ],
  )

  return (
    <PaginationContext.Provider value={contextValue}>
      <VStack
        as={motion.div}
        layout="size"
        spacing={6}
        align="stretch"
        {...restProps}
      >
        {children}
      </VStack>
    </PaginationContext.Provider>
  )
}
