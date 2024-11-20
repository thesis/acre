import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = [
  "container",
  "contentWrapper",
  "valueIcon",
  "valueWrapper",
  "valueAmount",
  "valueLabel",
  "progressWrapper",
  "progressLabelsWrapper",
  "progressLabel",
]

const containerStyles = defineStyle({
  w: "full",
  bgColor: "grey.700",
  bgGradient:
    "linear(to-r, transparent, rgba(255, 122, 0, 0.2) 10%, rgba(243, 73, 0, 0.25) 20%, transparent 30%)",
  color: "gold.200",
  mask: 'linear-gradient(0, black, black), url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MzkuNjI3IiBoZWlnaHQ9IjI4IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNzM5LjYyNyAwYzAgNi42MjctNS4zNyAxMi0xMiAxMkgyOS4yNTRhMTUuOTk2IDE1Ljk5NiAwIDAgMC0xMS4zMTMgNC42ODZsLTYuNjI4IDYuNjI4QzguMzEzIDI2LjMxNSA0LjI0MyAyOCAwIDI4aDczOS42Mjd6IiBzdHlsZT0iZmlsbDojMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDo4O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZCIvPjwvc3ZnPg==")',
  maskPosition: "100% 100%",
  clipPath: "inset(0 1px 0 0 round 12px)",
  maskComposite: "exclude",
  maskRepeat: "no-repeat",
})
const wrapperStyles = defineStyle({
  px: 5,
  py: 6,
  display: "flex",
  flexDirection: { base: "column", sm: "row" }, // 110px
  gap: { base: 5, md: "6.875rem" }, // 110px
})
const contentWrapperStyles = defineStyle({
  gridAutoFlow: "column",
  alignItems: "baseline",
  columnGap: 2,
})
const valueIconStyles = defineStyle({
  boxSize: 6,
  color: "brand.400",
  bg: "gold.200",
  rounded: "full",
  gridRowEnd: "span 2",
  transform: "auto",
  rotate: 9,
})
const valueWrapperStyles = defineStyle({
  alignItems: "start",
  gap: 0,
})
const progressWrapperStyles = defineStyle({
  flex: 1,
})
const progressLabelsWrapperStyles = defineStyle({
  w: "full",
})
const progressLabelStyles = defineStyle({
  ml: "auto",

  _after: {
    content: '""',
    display: "block",
    clipPath: "polygon(50% 100%, 0 0, 100% 0)",
    w: 3,
    h: 1,
    bgColor: "#5A4D3A",
    mx: "auto",
  },
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle({
  container: containerStyles,
  wrapper: wrapperStyles,
  contentWrapper: contentWrapperStyles,
  valueIcon: valueIconStyles,
  valueWrapper: valueWrapperStyles,
  progressWrapper: progressWrapperStyles,
  progressLabelsWrapper: progressLabelsWrapperStyles,
  progressLabel: progressLabelStyles,
})

export const acreTVLProgressTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})
