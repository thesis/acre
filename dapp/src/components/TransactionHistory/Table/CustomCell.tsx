import React from "react"
import { Box, Divider, useMultiStyleConfig } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import ViewInBlockExplorer from "#/components/shared/ViewInBlockExplorer"
import { ExplorerDataType } from "#/types"
import { isEthereumTransaction } from "#/utils"

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

function CustomCell({
  type,
  value1,
  value2,
}: {
  type: "text" | "block-explorer"
  value1: string
  value2: string
}) {
  switch (type) {
    case "text":
      return (
        <Cell
          children1={<TextSm fontWeight="semibold">{value1}</TextSm>}
          children2={<TextSm fontWeight="semibold">{value2}</TextSm>}
        />
      )
    case "block-explorer":
      return (
        <Cell
          children1={
            <ViewInBlockExplorer
              id={value1}
              type={ExplorerDataType.TRANSACTION}
              chain={isEthereumTransaction(value1) ? "ethereum" : "bitcoin"}
            />
          }
          children2={
            <ViewInBlockExplorer
              id={value2}
              type={ExplorerDataType.TRANSACTION}
              chain={isEthereumTransaction(value2) ? "ethereum" : "bitcoin"}
            />
          }
        />
      )
    default:
      return null
  }
}

export default CustomCell
