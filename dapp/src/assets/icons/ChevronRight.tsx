import React from "react"
import { createIcon } from "@chakra-ui/react"

export const ChevronRightIcon = createIcon({
  displayName: "ChevronRightIcon",
  viewBox: "0 0 16 17",
  defaultProps: {
    fill: "none",
    stroke: "red",
  },
  path: (
    <path
      d="M6 12.5L10 8.5L6 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
})
