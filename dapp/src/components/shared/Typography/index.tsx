import React from "react"
import { Heading, HeadingProps, Text, TextProps } from "@chakra-ui/react"

export function H1(props: HeadingProps) {
  return <Heading as="h1" size={{ base: "6xl", md: "7xl" }} {...props} />
}

export function H2(props: HeadingProps) {
  return <Heading as="h2" size={{ base: "5xl", md: "6xl" }} {...props} />
}

export function H3(props: HeadingProps) {
  return <Heading as="h3" size={{ base: "4xl", md: "5xl" }} {...props} />
}

export function H4(props: HeadingProps) {
  return <Heading as="h4" size={{ base: "3xl", md: "4xl" }} {...props} />
}

export function H5(props: HeadingProps) {
  return <Heading as="h5" size={{ base: "2xl", md: "3xl" }} {...props} />
}

export function H6(props: HeadingProps) {
  return <Heading as="h6" size={{ base: "xl", md: "2xl" }} {...props} />
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
