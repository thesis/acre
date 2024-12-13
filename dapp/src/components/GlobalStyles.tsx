import React from "react"
import { Global } from "@emotion/react"
import {
  SegmentRegular,
  SegmentMedium,
  SegmentSemiBold,
  SegmentBold,
  SegmentBlack,
} from "#/assets/fonts"

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
      `}
    />
  )
}
