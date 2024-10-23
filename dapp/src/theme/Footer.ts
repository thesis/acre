import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "wrapper", "logo", "list", "link"]

const containerStyles = defineStyle({
  w: "full",
  pos: "sticky",
  bottom: 0,
  left: 0,
  borderTop: "1px",
  borderColor: "gold.500",
  bgColor: "gold.300",
  zIndex: 1000,
})

const wrapperStyles = defineStyle({
  display: "flex",
  alignItems: "center",
  gap: { base: 4, xl: 10 },
  maxW: "120rem", // 1920px
  py: 3,
  px: { base: 10, xl: 30 },
  mx: "auto",
})

const logoStyles = defineStyle({
  boxSize: 8,
})

const listStyles = defineStyle({
  display: "flex",
  gap: { base: 2, xl: 5 },
  _last: {
    ml: "auto",
  },
})

const linkStyles = defineStyle({
  display: "flex",
  color: "grey.700",
  fontWeight: "medium",
  m: -2,
  p: 2,
  whiteSpace: "nowrap",
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle({
  container: containerStyles,
  wrapper: wrapperStyles,
  logo: logoStyles,
  list: listStyles,
  link: linkStyles,
})

export const footerTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})
