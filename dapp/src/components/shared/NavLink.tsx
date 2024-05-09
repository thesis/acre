import React from "react"
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from "@chakra-ui/react"
import {
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from "react-router-dom"

type NavLinkProps = Omit<ChakraLinkProps, "as" | "href" | "children"> &
  Pick<RouterNavLinkProps, "to" | "children">

export function NavLink(props: NavLinkProps) {
  const { children, ...restProps } = props
  return (
    <ChakraLink as={RouterNavLink} {...restProps}>
      {children as React.ReactNode}
    </ChakraLink>
  )
}
