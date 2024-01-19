import React from "react"
import { Box, Divider, useMultiStyleConfig } from "@chakra-ui/react"

function Cell({
  children1,
  children2,
}: {
  children1: React.ReactElement
  children2?: React.ReactElement
}) {
  const styles = useMultiStyleConfig("Table", { variant: "double-row" })
  const isDoubleRow = !!children2

  return (
    <Box __css={styles.cellContainer}>
      <Box __css={styles.cell}>{children1}</Box>
      {isDoubleRow && (
        <>
          <Divider __css={styles.divider} />
          <Box __css={styles.cell}>{children2}</Box>
        </>
      )}
    </Box>
  )
}

export default Cell
