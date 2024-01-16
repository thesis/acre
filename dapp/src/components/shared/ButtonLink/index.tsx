import React from "react"
import { Button, ButtonProps, Icon } from "@chakra-ui/react"
import { ArrowUpRight } from "#/static/icons"

type ButtonLinkProps = ButtonProps & {
  label?: string
  icon?: typeof Icon
  iconColor?: string
  onClick: () => void
}

export default function ButtonLink({
  children,
  icon = ArrowUpRight,
  iconColor = "brand.400",
  variant = "solid",
  onClick,
  justifyContent = "flex-start",
  ...props
}: ButtonLinkProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      justifyContent={justifyContent}
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
