import React from "react"
import {
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Text,
  HStack,
  Icon,
} from "@chakra-ui/react"
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
      <CardHeader
        as={HStack}
        spacing={1}
        alignItems="normal"
        fontWeight="bold"
        p={0}
      >
        <Text>{heading}</Text>
        <Icon as={IconLock} boxSize={5} />
      </CardHeader>
      <CardBody
        as={HStack}
        spacing={2}
        alignItems="center"
        color="green.400"
        fontWeight="semibold"
        p={0}
      >
        <Icon as={IconDiscountCheckFilled} boxSize={5} />
        <Text>Your seat is secured.</Text>
      </CardBody>
    </Card>
  )
}
