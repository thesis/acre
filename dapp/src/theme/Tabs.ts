import { mode } from "@chakra-ui/theme-tools"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"
import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Tabs: ComponentSingleStyleConfig = {
  variants: {
    underline: (props: StyleFunctionProps) => ({
      tab: {
        padding: 0,
        fontWeight: 700,
        borderBottom: "4px solid",
        borderColor: "transparent",
        background: "transparent",
        _selected: {
          // TODO: Set the correct color
          color: mode("black", "black")(props),
          borderColor: mode("#F34900", "#F34900")(props),
        },
        // TODO: Set the correct color
        color: mode("#675E60", "#675E60")(props),
      },
      tablist: {
        borderBottom: "none",
        gap: 8,
      },
    }),
  },
}

export default Tabs
