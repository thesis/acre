import React from "react"
import { Button, ButtonProps, Icon, Link, LinkProps } from "@chakra-ui/react"
import { IconArrowUpRight, TablerIcon } from "@tabler/icons-react"

type ButtonLinkProps = ButtonProps &
  LinkProps & {
    icon?: TablerIcon
    iconColor?: string
  }

export default function ButtonLink({
  children,
  icon = IconArrowUpRight,
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
