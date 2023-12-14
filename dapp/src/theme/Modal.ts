import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Modal: ComponentSingleStyleConfig = {
  baseStyle: {
    dialog: {
      p: 4,
      border: "2px",
      boxShadow: "none",
      borderColor: "white",
      borderRadius: "xl",
      bg: "gold.100",
    },
    closeButton: {
      top: -10,
      right: -10,
      rounded: "100%",
      bg: "opacity.white.5"
    },
    overlay: {
      bg: "none",
      backdropFilter: "auto",
      backdropBlur: "8px",
    },
  },
}

export default Modal
