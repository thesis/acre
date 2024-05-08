import React from "react"
import { HStack, StackProps, VStack } from "@chakra-ui/react"
import { motion } from "framer-motion"
import PaginationButton from "./PaginationButton"
import PaginationStatus from "./PaginationStatus"
import { PaginationContext } from "./PaginationContext"
import PaginationPage from "./PaginationPage"

export type PaginationProps<T> = Omit<StackProps, "children" | "as"> & {
  data: T[]
  children: (pageData: T[]) => React.ReactNode
  pageSize?: number
  defaultPage?: number
  dataLabel?: string
}

function Pagination<T>(props: PaginationProps<T>) {
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

  const contextValue = React.useMemo(
    () => ({
      pageSize,
      currentPage,
      direction,
      setPage: handleSetPage,
      totalSize: data.length,
      dataLabel,
    }),
    [pageSize, currentPage, data, dataLabel, direction, handleSetPage],
  )

  const pageData = React.useMemo(
    () => data.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
    [data, currentPage, pageSize],
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
        <PaginationPage>{children(pageData)}</PaginationPage>

        <HStack spacing={6}>
          <HStack spacing={2}>
            <PaginationButton mode="previous" />
            <PaginationButton mode="next" />
          </HStack>

          <PaginationStatus />
        </HStack>
      </VStack>
    </PaginationContext.Provider>
  )
}

export default Pagination
