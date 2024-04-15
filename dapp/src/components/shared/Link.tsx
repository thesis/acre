import React from "react"
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  NavLinkProps,
} from "react-router-dom"

type LinkProps = Omit<ChakraLinkProps, "as" | "href"> &
  Pick<NavLinkProps, "to"> & {
    isNavLink?: boolean
  }

function Link(props: LinkProps) {
  const { isNavLink = false, ...restProps } = props
  return (
    <ChakraLink as={isNavLink ? RouterNavLink : RouterLink} {...restProps} />
  )
}

export default Link
