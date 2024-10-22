import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "wrapper", "logo", "list", "link"]

const containerStyles = defineStyle({
  w: "full",
  pos: "fixed",
  bottom: 0,
  left: 0,
  borderTop: "1px",
  borderColor: "gold.500",
  bgColor: "gold.300",
})

const wrapperStyles = defineStyle({
  display: "flex",
  alignItems: "center",
  gap: 10,
  maxW: "page_content_max_width",
  py: 3,
  px: 10,
  mx: "auto",
})

const logoStyles = defineStyle({
  boxSize: 8,
})

const listStyles = defineStyle({
  display: "flex",
  gap: 5,
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
