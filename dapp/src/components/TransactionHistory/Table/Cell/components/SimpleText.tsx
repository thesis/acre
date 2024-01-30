import React from "react"
import { TextSm } from "#/components/shared/Typography"
import { TextProps } from "@chakra-ui/react"

function SimpleText({ ...textProps }: TextProps) {
  return <TextSm fontWeight="semibold" {...textProps} />
}

export default SimpleText
