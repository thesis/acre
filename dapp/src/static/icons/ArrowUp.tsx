import React from "react"
import { createIcon } from "@chakra-ui/react"

export const ArrowUp = createIcon({
  displayName: "ArrowUp",
  viewBox: "0 0 24 24",
  path: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 19V5M12 5L5 12M12 5L19 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
})
