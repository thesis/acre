import React from "react"
import { HStack, StackProps, VStack } from "@chakra-ui/react"
import PaginationButton from "./PaginationButton"
import PaginationStatus from "./PaginationStatus"

export type PaginationProps<T> = Omit<StackProps, "children"> & {
  data: T[]
  children: (pageData: T[]) => React.ReactNode
  pageSize?: number
}

function Pagination<T>(props: PaginationProps<T>) {
  const { data, children, ...restProps } = props

  return (
    <VStack {...restProps}>
      {children(data)}

      <HStack>
        <HStack>
          <PaginationButton mode="previous" />
          <PaginationButton mode="next" />
        </HStack>

        <PaginationStatus />
      </HStack>
    </VStack>
  )
}

export default Pagination
