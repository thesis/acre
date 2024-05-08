import React from "react"

type PaginationContextType<T = unknown> = {
  pageSize: number
  currentPage: number
  direction: "left" | "right"
  totalSize: number
  setPage: (page: number) => void
  dataLabel: string
  pageData: T[]
} | null

export const PaginationContext =
  React.createContext<PaginationContextType>(null)

export const usePagination = () => {
  const context = React.useContext(PaginationContext)
  if (!context) {
    throw new Error("usePagination must be used within a PaginationProvider")
  }
  return context
}
