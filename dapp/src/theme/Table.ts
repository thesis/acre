import { tableAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const BORDER_RADIUS_SIZE = "md"
const BORDER_STYLE = "1px solid white"

const KEYS = [...parts.keys, "cellContainer", "cell", "divider"] as const

const multiStyleConfig = createMultiStyleConfigHelpers(KEYS)

const variantDoubleRowTable = defineStyle({
  borderCollapse: "separate",
  borderSpacing: "0 8px",
})

const variantDoubleRowTd = defineStyle({
  p: 0,
  bg: "gold.100",
  borderTop: BORDER_STYLE,
  borderBottom: BORDER_STYLE,

  _last: {
    borderTopEndRadius: BORDER_RADIUS_SIZE,
    borderBottomEndRadius: BORDER_RADIUS_SIZE,
    borderRight: BORDER_STYLE,
  },

  _first: {
    borderTopStartRadius: BORDER_RADIUS_SIZE,
    borderBottomStartRadius: BORDER_RADIUS_SIZE,
    borderLeft: BORDER_STYLE,
  },
})

const variantDoubleRowTh = defineStyle({
  textTransform: "none",
  fontWeight: "semibold",
  fontSize: "sm",
  lineHeight: "sm",
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

const variantDoubleRow = multiStyleConfig.definePartsStyle({
  table: variantDoubleRowTable,
  td: variantDoubleRowTd,
  th: variantDoubleRowTh,
  cellContainer: variantDoubleRowCellContainer,
  cell: variantDoubleRowCell,
  divider: variantDoubleRowDivider,
})

const variants = {
  "double-row": variantDoubleRow,
}

export const tableTheme = multiStyleConfig.defineMultiStyleConfig({ variants })
