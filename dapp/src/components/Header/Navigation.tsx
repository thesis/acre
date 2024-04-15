import React from "react"
import { List, ListItem, StackProps, HStack, Box } from "@chakra-ui/react"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import Link from "../shared/Link"

export type NavigationItemType = {
  label: string
  href: string
}
type NavigationProps = StackProps & {
  items: NavigationItemType[]
}

function ActiveItemIndicator() {
  return (
    <Box
      as={motion.span}
      pos="absolute"
      bottom={0.5}
      left={0}
      w="full"
      h={0.5}
      bg="brand.400"
      layoutId="active-route-indicator"
    />
  )
}

function Navigation(props: NavigationProps) {
  const { items, ...restProps } = props
  const { pathname } = useLocation()

  return (
    <HStack as={List} spacing={5} ml={12} {...restProps}>
      {items.map((item) => (
        <ListItem key={item.href} pos="relative">
          <Link
            isNavLink
            to={item.href}
            display="block"
            fontSize="md"
            lineHeight="md"
            fontWeight="bold"
            mb={2}
            color="hsl(347, 5%, 39%)"
            _activeLink={{ color: "hsl(345, 6%, 13%)" }}
          >
            {item.label}
          </Link>
          {pathname === item.href && <ActiveItemIndicator />}
        </ListItem>
      ))}
    </HStack>
  )
}

export default Navigation
