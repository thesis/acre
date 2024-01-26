import React from "react"
import { Button, ButtonProps, Icon } from "@chakra-ui/react"
import { ArrowUpRight } from "#/assets/icons"

type ButtonLinkProps = ButtonProps & {
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
      variant={variant}
      justifyContent="flex-start"
      borderRadius="md"
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
