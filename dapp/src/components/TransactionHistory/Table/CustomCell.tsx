import React from "react"
import { Box, Divider, useMultiStyleConfig } from "@chakra-ui/react"
import { TextSm } from "../../shared/Typography"

function Cell({
  children1,
  children2,
}: {
  children1: React.ReactElement
  children2: React.ReactElement
}) {
  const styles = useMultiStyleConfig("Table", { variant: "double-row" })

  return (
    <Box __css={styles.cellContainer}>
      <Box __css={styles.cell}>{children1}</Box>
      <Divider __css={styles.divider} />
      <Box __css={styles.cell}>{children2}</Box>
    </Box>
  )
}
type CellValue = string | number

function CustomCell({
  type,
  value1,
  value2,
}: {
  type: "text"
  value1: CellValue
  value2: CellValue
}) {
  switch (type) {
    case "text":
      return (
        <Cell
          children1={<TextSm fontWeight="semibold">{value1}</TextSm>}
          children2={<TextSm fontWeight="semibold">{value2}</TextSm>}
        />
      )
    default:
      return null
  }
}

export default CustomCell
