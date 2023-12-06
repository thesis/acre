import { mode } from "@chakra-ui/theme-tools"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"
import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Stepper: ComponentSingleStyleConfig = {
  baseStyle: {
    indicator: {
      borderRadius: 4,
      fontWeight: "500",
    },
    step: {
      gap: 6,
    },
  },
  variants: {
    basic: (props: StyleFunctionProps) => ({
      indicator: {
        "&[data-status=complete]": {
          // TODO: Set the correct color
          background: mode("black", "purple")(props),
        },
      },
      separator: {
        "&[data-status=complete]": {
          // TODO: Set the correct color
          background: mode("black", "purple")(props),
        },
      },
    }),
  },
}

export default Stepper
