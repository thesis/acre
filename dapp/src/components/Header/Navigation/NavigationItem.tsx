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
import { SEARCH_PARAMS_NAMES } from "#/router/path"
import { referralProgram } from "#/utils"
import { NavLink } from "../../shared/NavLink"

type NavigationItemProps = ListItemProps & NavigationItemType

function NavigationItem(props: NavigationItemProps) {
  const { label, href, ...restProps } = props
  const styles = useMultiStyleConfig("Link", { variant: "navigation" })
  const [searchParams] = useSearchParams()

  const referralParam = searchParams.get(SEARCH_PARAMS_NAMES.referral)
  const to: To = {
    pathname: href,
    ...(referralParam && {
      search: `?${SEARCH_PARAMS_NAMES.referral}=${referralParam}`,
    }),
  }

  const isDisabled = !referralProgram.isValidReferral(Number(referralParam))

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
