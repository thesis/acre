import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Drawer: ComponentSingleStyleConfig = {
  baseStyle: {
    dialogContainer: {
      zIndex: "drawer",
    },
    overlay: {
      bg: "none",
      backdropFilter: "auto",
      backdropBlur: "8px",
    },
    dialog: {
      borderTop: "2px",
      borderLeft: "2px",
      boxShadow: "none",
      borderColor: "white",
      borderTopLeftRadius: "xl",
      bg: "gold.100",
    },
  },
}

export default Drawer
