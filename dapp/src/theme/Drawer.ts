import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Drawer: ComponentSingleStyleConfig = {
  baseStyle: {
    dialogContainer: {
      zIndex: "drawer",
    },
    overlay: {
      bg: "gold.300",
    },
    dialog: {
      borderTop: "2px",
      borderLeft: "2px",
      boxShadow: "none",
      borderColor: "white",
      borderTopLeftRadius: "xl",
      bg: "gold.200",
    },
  },
}

export default Drawer
