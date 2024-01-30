import React from "react"
import { TransactionInfo } from "#/types"
import Cell from "."
import { ContentType, getCustomContent } from "./utils"

function CustomCell({
  type,
  firstTransaction,
  secondTransaction,
}: {
  type: ContentType
  firstTransaction: TransactionInfo
  secondTransaction: TransactionInfo
}) {
  if (type === "date") {
    return <Cell firstField={getCustomContent(type, firstTransaction)} />
  }

  return (
    <Cell
      firstField={getCustomContent(type, firstTransaction)}
      secondField={getCustomContent(type, secondTransaction)}
    />
  )
}

export default CustomCell
