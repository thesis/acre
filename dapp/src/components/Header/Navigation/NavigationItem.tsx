import React from "react"
import {
  Box,
  ListItem,
  ListItemProps,
  useMultiStyleConfig,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { NavLink } from "../../shared/Link"

export type NavigationItemProps = ListItemProps & {
  label: string
  href: string
}

function NavigationItem(props: NavigationItemProps) {
  const { label, href, ...restProps } = props
  const styles = useMultiStyleConfig("Link", { variant: "navigation" })

  return (
    <ListItem pos="relative" {...restProps}>
      <NavLink to={href} sx={styles.container}>
        {({ isActive }) => (
          <>
            {label}
            {isActive && (
              <Box
                as={motion.span}
                layoutId="active-route-indicator"
                sx={styles.indicator}
              />
            )}
          </>
        )}
      </NavLink>
    </ListItem>
  )
}

export default NavigationItem
