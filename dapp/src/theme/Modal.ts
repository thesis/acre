import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Modal: ComponentSingleStyleConfig = {
  baseStyle: {
    dialog: {
      p: 4,
      border: "2px",
      boxShadow: "none",
      borderColor: "white",
      borderRadius: "xl",
      // TODO: Use the correct variables
      bg: "#FBF7EC",
    },
    closeButton: {
      top: -10,
      right: -10,
      rounded: "100%",
      // TODO: Use the correct variables
      bg: "#FBF7EC",
    },
  },
}

export default Modal
