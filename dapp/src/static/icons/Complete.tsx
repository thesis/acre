import React from "react"
import { createIcon } from "@chakra-ui/react"

export const Complete = createIcon({
  displayName: "Complete",
  viewBox: "0 0 20 20",
  path: [
    <rect width="20" height="20" rx="10" fill="currentColor" />,
    <path
      d="M14 7.5L8.5 13L6 10.5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  ],
})
