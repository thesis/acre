import { css } from "@emotion/react"

export default function PopoverStyles() {
  return css(`
    .chakra-popover__content:focus-visible {
      box-shadow: none !important;
    }`)
}
