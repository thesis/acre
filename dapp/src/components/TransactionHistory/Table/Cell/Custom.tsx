import React from "react"
import { TransactionInfo } from "#/types"
import Cell from "."
import { ContentType, getCustomContent } from "./utils/content"

function CustomCell({
  type,
  transaction1,
  transaction2,
}: {
  type: ContentType
  transaction1: TransactionInfo
  transaction2: TransactionInfo
}) {
  if (type === "date") {
    return <Cell children1={getCustomContent(type, transaction1)} />
  }

  return (
    <Cell
      children1={getCustomContent(type, transaction1)}
      children2={getCustomContent(type, transaction2)}
    />
  )
}

export default CustomCell
