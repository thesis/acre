import { tableAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const KEYS = [...parts.keys, "cellContainer", "cell", "divider"] as const

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(KEYS)

const variantDoubleRowTable = defineStyle({
  borderCollapse: "separate",
  borderSpacing: "0 8px",
})

const variantDoubleRowTd = defineStyle({
  p: 0,
  bg: "gold.100",
  borderTop: "1px solid white",
  borderBottom: "1px solid white",

  _last: {
    borderTopEndRadius: "md",
    borderBottomEndRadius: "md",
    borderRight: "1px solid white",
  },

  _first: {
    borderTopStartRadius: "md",
    borderBottomStartRadius: "md",
    borderLeft: "1px solid white",
  },
})

const variantDoubleRowCellContainer = defineStyle({
  display: "flex",
  flexDirection: "column",
})

const variantDoubleRowCell = defineStyle({
  p: 4,
})

const variantDoubleRowDivider = defineStyle({
  borderColor: "gold.200",
  borderBottomWidth: "2px",
})

const variantDoubleRow = definePartsStyle({
  table: variantDoubleRowTable,
  td: variantDoubleRowTd,
  cellContainer: variantDoubleRowCellContainer,
  cell: variantDoubleRowCell,
  divider: variantDoubleRowDivider,
})

const variants = {
  "double-row": variantDoubleRow,
}

export const tableTheme = defineMultiStyleConfig({ variants })
