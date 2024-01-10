import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["sidebarContainer", "sidebar"]

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(PARTS)

const sidebarWidth = 80

const baseStyleSidebarContainer = defineStyle({
  top: 0,
  right: 0,
  w: 0,
  h: "100vh",
  position: "fixed",
  overflow: "hidden",
  zIndex: "sidebar",
  transition: "width 0.3s",
})

const expandedBaseStyleSidebarContainer = defineStyle({
  ...baseStyleSidebarContainer,
  w: sidebarWidth,
})

const baseStyleSidebar = defineStyle({
  p: 4,
  height: "100%",
  w: sidebarWidth,
  bg: "gold.200",
  borderTop: "2px",
  borderLeft: "2px",
  borderColor: "gold.100",
  borderTopLeftRadius: "xl",
})

const baseStyle = definePartsStyle({
  collapsedSidebarContainer: baseStyleSidebarContainer,
  expandedSidebarContainer: expandedBaseStyleSidebarContainer,
  sidebar: baseStyleSidebar,
})

const Sidebar = defineMultiStyleConfig({ baseStyle })

export default Sidebar
