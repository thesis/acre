import React from "react"
import { createIcon } from "@chakra-ui/react"

export default createIcon({
  displayName: "LoadingSpinnerSuccessIcon",
  viewBox: "0 0 56 56",
  defaultProps: {
    fill: "none",
  },
  path: [
    <g filter="url(#filter0_b_55_2073)">
      <circle cx="28" cy="28" r="28" fill="#33A321" fillOpacity="0.15" />
    </g>,
    <path
      d="M37 22L25 34L19 28.5"
      stroke="#33A321"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    <defs>
      <filter
        id="filter0_b_55_2073"
        x="-16"
        y="-16"
        width="88"
        height="88"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="8" />
        <feComposite
          in2="SourceAlpha"
          operator="in"
          result="effect1_backgroundBlur_55_2073"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_backgroundBlur_55_2073"
          result="shape"
        />
      </filter>
    </defs>,
  ],
})
