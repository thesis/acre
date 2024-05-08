import React from "react"

type PaginationContextType = {
  pageSize: number
  currentPage: number
  direction: "left" | "right"
  totalSize: number
  setPage: (page: number) => void
  dataLabel: string
}

export const PaginationContext = React.createContext<PaginationContextType>({
  pageSize: 10,
  currentPage: 0,
  direction: "left",
  totalSize: 0,
  setPage: () => {},
  dataLabel: "items",
})

export const usePagination = () => React.useContext(PaginationContext)
