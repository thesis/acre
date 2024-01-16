import React from "react"
import { TextSm } from "#/components/shared/Typography"
import CellWrapper from "./CellWrapper"

function TextCell({
  value1,
  value2,
}: {
  value1: string | number
  value2: string | number
}) {
  return (
    <CellWrapper
      children1={<TextSm fontWeight="semibold">{value1}</TextSm>}
      children2={<TextSm fontWeight="semibold">{value2}</TextSm>}
    />
  )
}

export default TextCell
