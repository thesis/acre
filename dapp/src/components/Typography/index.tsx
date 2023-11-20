import React from "react"
import { Text, TextProps } from "@chakra-ui/react"

export function BodySm(props: TextProps) {
  return (
    <Text
      as="p"
      fontWeight="400"
      fontSize="14px"
      lineHeight="24px"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  )
}

export function BodyMd(props: TextProps) {
  return (
    <Text
      as="p"
      fontWeight="400"
      fontSize="16px"
      lineHeight="24px"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  )
}
