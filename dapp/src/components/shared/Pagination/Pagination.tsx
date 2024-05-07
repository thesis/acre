import React from "react"
import { HStack, StackProps, VStack } from "@chakra-ui/react"
import PaginationButton from "./PaginationButton"
import PaginationStatus from "./PaginationStatus"
import { PaginationContext } from "./PaginationContext"

export type PaginationProps<T> = Omit<StackProps, "children"> & {
  data: T[]
  children: (pageData: T[]) => React.ReactNode
  pageSize?: number
  defaultPage?: number
}

function Pagination<T>(props: PaginationProps<T>) {
  const { data, children, pageSize = 10, defaultPage = 0, ...restProps } = props

  const [currentPage, setCurrentPage] = React.useState(defaultPage)
  const contextValue = React.useMemo(
    () => ({
      pageSize,
      page: currentPage,
      setPage: setCurrentPage,
      totalSize: data.length,
    }),
    [currentPage, pageSize, data],
  )

  const pageData = React.useMemo(
    () => data.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
    [data, currentPage, pageSize],
  )

  return (
    <PaginationContext.Provider value={contextValue}>
      <VStack {...restProps}>
        {children(pageData)}

        <HStack>
          <HStack>
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
