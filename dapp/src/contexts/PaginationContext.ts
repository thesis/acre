import React from "react"

type PaginationContextType<T = unknown> = {
  pageSize: number
  page: number
  totalSize: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  pageData: T[]
} | null

export const PaginationContext =
  React.createContext<PaginationContextType>(null)
