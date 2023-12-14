import { ComponentMultiStyleConfig } from "@chakra-ui/react"

const Sidebar: ComponentMultiStyleConfig = {
  parts: ["sidebarContainer", "sidebar"],
  baseStyle: {
    sidebarContainer: {
      top: 0,
      right: 0,
      h: "100vh",
      position: "fixed",
      overflow: "hidden",
      zIndex: "sidebar",
      transition: "width 0.3s",
    },
    sidebar: {
      p: 4,
      height: "100%",
      bg: "gold.200",
      borderTop: "2px",
      borderLeft: "2px",
      borderColor: "gold.100",
      borderTopLeftRadius: "xl",
    },
  },
}

export default Sidebar
