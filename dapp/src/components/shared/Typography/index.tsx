import React from "react"
import { Text, TextProps } from "@chakra-ui/react"

export function TextXl(props: TextProps) {
  return (
    <Text as="p" fontWeight="medium" fontSize="xl" lineHeight="xl" {...props} />
  )
}

export function TextLg(props: TextProps) {
  return (
    <Text as="p" fontWeight="medium" fontSize="lg" lineHeight="lg" {...props} />
  )
}

export function TextMd(props: TextProps) {
  return (
    <Text as="p" fontWeight="medium" fontSize="md" lineHeight="md" {...props} />
  )
}

export function TextSm(props: TextProps) {
  return (
    <Text as="p" fontWeight="medium" fontSize="sm" lineHeight="sm" {...props} />
  )
}

export function TextXs(props: TextProps) {
  return (
    <Text as="p" fontWeight="medium" fontSize="xs" lineHeight="xs" {...props} />
  )
}
