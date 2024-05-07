import React from "react"

type PaginationContextType = {
  pageSize: number
  page: number
  totalSize: number
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export const PaginationContext = React.createContext<PaginationContextType>({
  pageSize: 10,
  page: 0,
  totalSize: 0,
  setPage: () => {},
})

export const usePagination = () => React.useContext(PaginationContext)
