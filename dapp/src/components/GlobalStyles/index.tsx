import React from "react"
import { Global } from "@emotion/react"

import FontStyles from "./fonts"
import PopoverStyles from "./popover"

export default function GlobalStyles() {
  return <Global styles={[FontStyles, PopoverStyles]} />
}
