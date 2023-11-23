import React from "react"
import { createIcon } from "@chakra-ui/react"

export const ArrowDown = createIcon({
  displayName: "ArrowDown",
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
        d="M12 5V19M12 19L19 12M12 19L5 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
})
