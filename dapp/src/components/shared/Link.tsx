import React from "react"
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from "react-router-dom"

type LinkProps = Omit<ChakraLinkProps, "as" | "href"> &
  Pick<RouterLinkProps, "to">

type NavLinkProps = Omit<ChakraLinkProps, "as" | "href" | "children"> &
  Pick<RouterNavLinkProps, "to" | "children">

export function Link(props: LinkProps) {
  return <ChakraLink as={RouterLink} {...props} />
}

export function NavLink(props: NavLinkProps) {
  const { children, ...restProps } = props
  return (
    <ChakraLink as={RouterNavLink} {...restProps}>
      {children as React.ReactNode}
    </ChakraLink>
  )
}
