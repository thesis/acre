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
  bg: "gold.200",
  borderTop: "2px",
  borderLeft: "2px",
  borderColor: "gold.100",
  borderTopLeftRadius: "xl",
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle({
  sidebarContainer: baseStyleSidebarContainer,
  sidebar: baseStyleSidebar,
})

const Sidebar = multiStyleConfig.defineMultiStyleConfig({ baseStyle })

export default Sidebar
