import React, { useId } from "react"
import {
  Button,
  ButtonProps,
  ComponentWithAs,
  Icon,
  IconProps,
} from "@chakra-ui/react"
import { ArrowUpRight } from "#/static/icons"
import { TextSm } from "../Typography"

type ButtonLinkProps = ButtonProps & {
  label: string
  link?: string
  icon?: ComponentWithAs<"svg", IconProps>
  iconColor?: string
  isFullWidth?: boolean
  onClick: () => void
}

export default function ButtonLink({
  variant = "outline",
  label = "",
  icon = ArrowUpRight,
  iconColor = "brand.400",
  isFullWidth = true,
  justifyContent = "flex-start",
  onClick,
  ...props
}: ButtonLinkProps) {
  const key = useId()

  return (
    <Button
      key={key}
      variant={variant}
      onClick={onClick}
      colorScheme="link"
      width={isFullWidth ? "100%" : "auto"}
      justifyContent={justifyContent}
      leftIcon={
        <Icon
          as={icon}
          boxSize={4}
          color={variant === "solid" ? "white" : iconColor}
        />
      }
      {...props}
    >
      <TextSm>{label}</TextSm>
    </Button>
  )
}
