import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["sidebarContainer", "sidebar"]

const baseStyleSidebarContainer = defineStyle({
  top: 0,
  right: 0,
  h: "100vh",
  position: "fixed",
  overflow: "hidden",
  zIndex: "sidebar",
  transition: "width 0.3s",
})

const baseStyleSidebar = defineStyle({
  p: 4,
  height: "100%",
  w: "sidebar_width",
  bg: "gold.200",
  borderTop: "2px",
  borderLeft: "2px",
  borderColor: "gold.100",
  borderTopLeftRadius: "xl",
  display: "flex",
  flexDirection: "column",
  gap: 3,
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle({
  sidebarContainer: baseStyleSidebarContainer,
  sidebar: baseStyleSidebar,
})

export const sidebarTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})
