import React from "react"
import { Box, ListItem, ListItemProps } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { NavLink } from "../../shared/Link"

export type NavigationItemProps = ListItemProps & {
  label: string
  href: string
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

function NavigationItem(props: NavigationItemProps) {
  const { label, href, ...restProps } = props

  return (
    <ListItem pos="relative" {...restProps}>
      <NavLink
        to={href}
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
            {label}
            {isActive && <ActiveItemIndicator />}
          </>
        )}
      </NavLink>
    </ListItem>
  )
}

export default NavigationItem
