import React from "react"
import { Global } from "@emotion/react"

import SegmentRegular from "../../fonts/Segment-Regular.otf"
import SegmentMedium from "../../fonts/Segment-Medium.otf"
import SegmentSemiBold from "../../fonts/Segment-SemiBold.otf"
import SegmentBold from "../../fonts/Segment-Bold.otf"
import SegmentBlack from "../../fonts/Segment-Black.otf"

export default function GlobalStyles() {
  return (
    <Global
      styles={`
        @font-face {
          font-family: "Segment";
          src: url(${SegmentRegular}) format("otf");
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentMedium}) format("otf");
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentSemiBold}) format("otf");
          font-weight: 600;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentBold}) format("otf");
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: "Segment";
          src: url(${SegmentBlack}) format("otf");
          font-weight: 900;
          font-style: normal;
        }
      `}
    />
  )
}
