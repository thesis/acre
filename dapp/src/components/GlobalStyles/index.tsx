import React from "react"
import { Global } from "@emotion/react"

import SegmentRegular from "#/assets/fonts/Segment-Regular.otf"
import SegmentMedium from "#/assets/fonts/Segment-Medium.otf"
import SegmentSemiBold from "#/assets/fonts/Segment-SemiBold.otf"
import SegmentBold from "#/assets/fonts/Segment-Bold.otf"
import SegmentBlack from "#/assets/fonts/Segment-Black.otf"

export default function GlobalStyles() {
  return (
    <Global
      styles={`
        @font-face {
          font-family: "Segment";
          src: url(${SegmentRegular}) format("opentype");
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentMedium}) format("opentype");
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentSemiBold}) format("opentype");
          font-weight: 600;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentBold}) format("opentype");
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentBlack}) format("opentype");
          font-weight: 900;
          font-style: normal;
        }
        .chakra-popover__content:focus-visible {
          box-shadow: none !important;
        }
      `}
    />
  )
}
