import React from "react"
import { Box, Divider, useMultiStyleConfig } from "@chakra-ui/react"

function Cell({
  firstField,
  secondField,
}: {
  firstField?: React.ReactElement
  secondField?: React.ReactElement
}) {
  const styles = useMultiStyleConfig("Table", { variant: "double-row" })
  const isDoubleRow = !!secondField

  if (!firstField) return null

  return (
    <Box __css={styles.cellContainer}>
      <Box __css={styles.cell}>{firstField}</Box>
      {isDoubleRow && (
        <>
          <Divider __css={styles.divider} />
          <Box __css={styles.cell}>{secondField}</Box>
        </>
      )}
    </Box>
  )
}

export default Cell
