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
        // React-slick package: Chakra-ui with react-slick package doesn't 
        // generate flex style for auto-generated slick-track wrapper.
        .slick-track {
          display: flex;
        }
        // React-slick package: Hiding arrows instead of disabling them in case 
        // when carousel is not fully completed by slides.
        [data-id="slick-arrow-prev"]:disabled:has(~ [data-id="slick-arrow-next"]:disabled),
        [data-id="slick-arrow-prev"]:disabled ~ [data-id="slick-arrow-next"]:disabled{
          display: none;
        }
      `}
    />
  )
}
