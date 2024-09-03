import React from "react"
import { ListItem, useMultiStyleConfig } from "@chakra-ui/react"
import { To, useSearchParams } from "react-router-dom"
import { useModal } from "#/hooks"
import { isString } from "#/utils"
import { NavLink, NavLinkProps } from "../../shared/NavLink"

export type NavigationItemProps = NavLinkProps

function NavigationItem(props: NavigationItemProps) {
  const { children, to: defaultTo, isExternal, ...restProps } = props
  const styles = useMultiStyleConfig("Link", {
    variant: "navigation",
    size: "md",
  })
  const [searchParams] = useSearchParams()
  const { isOpenGlobalErrorModal } = useModal()
  const isDisabled = isOpenGlobalErrorModal

  const to: To = isExternal
    ? defaultTo
    : {
        pathname: isString(defaultTo) ? defaultTo : defaultTo.pathname,
        search: searchParams.toString(),
      }

  return (
    <ListItem>
      <NavLink
        to={to}
        sx={styles.container}
        pointerEvents={isDisabled ? "none" : "auto"}
        {...(isExternal && {
          target: "_blank",
        })}
        {...restProps}
      >
        {children}
      </NavLink>
    </ListItem>
  )
}

export default NavigationItem
