import { SortASC, SortDESC } from "#/static/icons"
import { SortDirection } from "@tanstack/react-table"
import { Icon } from "@chakra-ui/react"

const BOX_SIZE = 1.5

const getSortIconColor = (
  isSorted: false | SortDirection,
  direction: SortDirection,
) => {
  if (isSorted === direction) return "brand.400"

  return undefined
}

export const SORT_ICONS: {
  key: SortDirection
  icon: typeof Icon
  boxSize: number
  getColor: (isSorted: false | SortDirection) => string | undefined
}[] = [
  {
    key: "asc",
    icon: SortASC,
    boxSize: BOX_SIZE,
    getColor: (isSorted) => getSortIconColor(isSorted, "asc"),
  },
  {
    key: "desc",
    icon: SortDESC,
    boxSize: BOX_SIZE,
    getColor: (isSorted) => getSortIconColor(isSorted, "desc"),
  },
]
