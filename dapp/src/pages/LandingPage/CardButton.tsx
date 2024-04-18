import React from "react"
import { Link, Button, ButtonProps, LinkProps, Icon } from "@chakra-ui/react"
import { IconArrowUpRight } from "@tabler/icons-react"

type CardButtonProps = ButtonProps & Pick<LinkProps, "isExternal" | "href">

export default function CardButton(props: CardButtonProps) {
  const { children, isExternal, ...restProps } = props
  return (
    <Button
      as={Link}
      variant="card"
      isExternal={isExternal}
      {...restProps}
      _hover={{ bg: "gold.100" }}
      leftIcon={
        isExternal ? (
          <Icon as={IconArrowUpRight} color="brand.400" w={4} h={4} />
        ) : undefined
      }
      iconSpacing={1}
      fontWeight="semibold"
    >
      {children}
    </Button>
  )
}
