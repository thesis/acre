import React from "react"
import { Box, Divider, useMultiStyleConfig } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import ViewInBlockExplorer from "#/components/shared/ViewInBlockExplorer"
import { Asset, ExplorerDataType } from "#/types"
import { isEthereumTransaction } from "#/utils"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"

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
  type: "text" | "currency-balance" | "block-explorer"
  value1: string | number | Asset
  value2: string | number | Asset
}) {
  switch (type) {
    case "text":
      return (
        <Cell
          children1={<TextSm fontWeight="semibold">{value1 as string}</TextSm>}
          children2={<TextSm fontWeight="semibold">{value2 as string}</TextSm>}
        />
      )
    case "currency-balance": {
      const asset1 = value1 as Asset
      const asset2 = value2 as Asset

      return (
        <Cell
          children1={
            <CurrencyBalance
              currency={asset1.currency}
              amount={asset1.amount}
              size="sm"
            />
          }
          children2={
            <CurrencyBalance
              currency={asset2.currency}
              amount={asset2.amount}
              size="sm"
            />
          }
        />
      )
    }
    case "block-explorer": {
      const id1 = value1 as string
      const id2 = value2 as string

      return (
        <Cell
          children1={
            <ViewInBlockExplorer
              id={id1}
              type={ExplorerDataType.TRANSACTION}
              chain={isEthereumTransaction(id1) ? "ethereum" : "bitcoin"}
            />
          }
          children2={
            <ViewInBlockExplorer
              id={id2}
              type={ExplorerDataType.TRANSACTION}
              chain={isEthereumTransaction(id2) ? "ethereum" : "bitcoin"}
            />
          }
        />
      )
    }
    default:
      return null
  }
}

export default CustomCell
