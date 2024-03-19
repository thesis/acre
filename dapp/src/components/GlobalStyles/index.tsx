import React from "react"
import { Global } from "@emotion/react"

import FontStyles from "./fonts"

export default function GlobalStyles() {
  return <Global styles={[FontStyles]} />
}
