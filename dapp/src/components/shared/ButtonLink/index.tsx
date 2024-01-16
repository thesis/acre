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
  label?: string
  icon?: ComponentWithAs<"svg", IconProps>
  iconColor?: string
  isFullWidth?: boolean
  onClick: () => void
}

export default function ButtonLink({
  variant = "solid",
  icon = ArrowUpRight,
  iconColor = "brand.400",
  isFullWidth = true,
  justifyContent = "flex-start",
  onClick,
  label,
  ...props
}: ButtonLinkProps) {
  const key = useId()

  return (
    <Button
      key={key}
      variant={variant}
      onClick={onClick}
      width={isFullWidth ? "100%" : "auto"}
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
      <TextSm>{label}</TextSm>
    </Button>
  )
}
