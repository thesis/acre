import React from "react"
import { Button, ButtonProps, Icon, Link, LinkProps } from "@chakra-ui/react"
import { ArrowUpRight } from "#/assets/icons"

type ButtonLinkProps = ButtonProps &
  LinkProps & {
    icon?: typeof Icon
    iconColor?: string
  }

export default function ButtonLink({
  children,
  icon = ArrowUpRight,
  iconColor = "brand.400",
  variant = "outline",
  ...props
}: ButtonLinkProps) {
  return (
    <Button
      as={Link}
      variant={variant}
      justifyContent="flex-start"
      leftIcon={
        <Icon
          as={icon}
          boxSize={4}
          color={variant === "solid" ? "white" : iconColor}
        />
      }
      {...props}
    >
      {children}
    </Button>
  )
}
