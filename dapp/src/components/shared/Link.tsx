import React from "react"
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom"

type LinkProps = Omit<ChakraLinkProps, "as" | "href"> &
  Pick<RouterLinkProps, "to">

export function Link(props: LinkProps) {
  return <ChakraLink as={RouterLink} {...props} />
}
