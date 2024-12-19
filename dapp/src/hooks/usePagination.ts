import React from "react"
import { PaginationContext } from "#/contexts"

const usePagination = () => {
  const context = React.useContext(PaginationContext)
  if (!context) {
    throw new Error("usePagination must be used within a PaginationProvider")
  }
  return context
}

export default usePagination
