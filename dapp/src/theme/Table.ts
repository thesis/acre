import { tableAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const KEYS = [...parts.keys, "cellContainer", "cell", "divider"] as const

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(KEYS)

const baseStyleTable = defineStyle({
  borderCollapse: "separate",
  borderSpacing: "0 8px",
})

const baseStyleTd = defineStyle({
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

const baseStyleCellContainer = defineStyle({
  display: "flex",
  flexDirection: "column",
})

const baseStyleCell = defineStyle({
  p: 4,
})

const baseStyleDivider = defineStyle({
  borderColor: "gold.200",
  borderBottomWidth: "2px",
})

const variantDoubleRow = definePartsStyle({
  table: baseStyleTable,
  td: baseStyleTd,
  cellContainer: baseStyleCellContainer,
  cell: baseStyleCell,
  divider: baseStyleDivider,
})

const variants = {
  "double-row": variantDoubleRow,
}

export const tableTheme = defineMultiStyleConfig({ variants })
