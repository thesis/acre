import React from "react"
import { Text, TextProps } from "@chakra-ui/react"

export function H2Xl(props: TextProps) {
  return (
    <Text
      as="h1"
      fontWeight="medium"
      fontSize="h2Xl"
      lineHeight="h2Xl"
      {...props}
    />
  )
}

export function HXl(props: TextProps) {
  return (
    <Text
      as="h2"
      fontWeight="medium"
      fontSize="hXl"
      lineHeight="hXl"
      {...props}
    />
  )
}

export function HLg(props: TextProps) {
  return (
    <Text
      as="h3"
      fontWeight="medium"
      fontSize="hLg"
      lineHeight="hLg"
      {...props}
    />
  )
}

export function HMd(props: TextProps) {
  return (
    <Text
      as="h4"
      fontWeight="medium"
      fontSize="hMd"
      lineHeight="hMd"
      {...props}
    />
  )
}

export function HSm(props: TextProps) {
  return (
    <Text
      as="h5"
      fontWeight="medium"
      fontSize="hSm"
      lineHeight="hSm"
      {...props}
    />
  )
}

export function HXs(props: TextProps) {
  return (
    <Text
      as="h6"
      fontWeight="medium"
      fontSize="hXs"
      lineHeight="hXs"
      {...props}
    />
  )
}

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
