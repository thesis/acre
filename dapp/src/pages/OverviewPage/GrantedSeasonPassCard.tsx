import React from "react"
import { Card, CardBody, CardHeader, CardProps, Icon } from "@chakra-ui/react"
import { IconDiscountCheckFilled, IconLock } from "@tabler/icons-react"

type GrantedSeasonPassCardProps = CardProps & {
  heading: string
}

export default function GrantedSeasonPassCard(
  props: GrantedSeasonPassCardProps,
) {
  const { heading, ...restProps } = props

  return (
    <Card size="md" px={5} py={4} gap={4} {...restProps}>
      <CardHeader fontWeight="bold" p={0}>
        {heading}
        <Icon
          as={IconLock}
          ml={1}
          my={0.5}
          boxSize={5}
          verticalAlign="bottom"
        />
      </CardHeader>
      <CardBody color="green.400" fontWeight="semibold" p={0}>
        <Icon
          as={IconDiscountCheckFilled}
          mr={2}
          my={0.5}
          boxSize={5}
          verticalAlign="bottom"
        />
        Your seat is secured.
      </CardBody>
    </Card>
  )
}
