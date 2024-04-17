import React from "react"
import { List, ListItem, HStack, Box, BoxProps } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { NavLink } from "../shared/Link"

export type NavigationItemType = {
  label: string
  href: string
}
type NavigationProps = BoxProps & {
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

  return (
    <Box as="nav" {...restProps}>
      <HStack as={List} spacing={5} ml={12}>
        {items.map((item) => (
          <ListItem key={item.href} pos="relative">
            <NavLink
              to={item.href}
              display="block"
              fontSize="md"
              lineHeight="md"
              fontWeight="bold"
              mb={2}
              color="grey.500"
              _activeLink={{ color: "grey.700" }}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && <ActiveItemIndicator />}
                </>
              )}
            </NavLink>
          </ListItem>
        ))}
      </HStack>
    </Box>
  )
}

export default Navigation
