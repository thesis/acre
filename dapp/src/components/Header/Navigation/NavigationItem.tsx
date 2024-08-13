import React from "react"
import {
  Box,
  ListItem,
  ListItemProps,
  useMultiStyleConfig,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { NavigationItemType } from "#/types/navigation"
import { To, useSearchParams } from "react-router-dom"
import { useModal } from "#/hooks"
import { NavLink } from "../../shared/NavLink"

type NavigationItemProps = ListItemProps & NavigationItemType

function NavigationItem(props: NavigationItemProps) {
  const { label, href, ...restProps } = props
  const styles = useMultiStyleConfig("Link", { variant: "navigation" })
  const [searchParams] = useSearchParams()
  const { isOpenGlobalErrorModal } = useModal()
  const isDisabled = isOpenGlobalErrorModal

  const to: To = {
    pathname: href,
    search: searchParams.toString(),
  }

  return (
    <ListItem pos="relative" {...restProps}>
      <NavLink
        to={to}
        sx={styles.container}
        pointerEvents={isDisabled ? "none" : "auto"}
      >
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
