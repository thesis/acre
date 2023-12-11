import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Drawer: ComponentSingleStyleConfig = {
  baseStyle: {
    dialogContainer: {
      zIndex: "drawer",
    },
    overlay: {
      // TODO: Use the correct variables
      bg: "#F3E5C1",
    },
    dialog: {
      borderTop: "2px",
      borderLeft: "2px",
      boxShadow: "none",
      borderColor: "white",
      borderTopLeftRadius: "xl",
      // TODO: Use the correct variables
      bg: "#F8EFDA",
    },
  },
}

export default Drawer
