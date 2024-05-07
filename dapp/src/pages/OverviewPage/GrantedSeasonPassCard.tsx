import React from "react"
import {
  Card,
  CardBody,
  CardHeader,
  CardProps,
  HStack,
  Icon,
} from "@chakra-ui/react"
import { IconDiscountCheckFilled, IconLock } from "@tabler/icons-react"
import { TextMd } from "#/components/shared/Typography"

type GrantedSeasonPassCardProps = CardProps & {
  heading: string
}

export default function GrantedSeasonPassCard(
  props: GrantedSeasonPassCardProps,
) {
  const { heading, ...restProps } = props

  return (
    <Card size="md" px={5} py={4} gap={4} {...restProps}>
      <CardHeader as={HStack} spacing={1} alignItems="normal" p={0}>
        <TextMd fontWeight="bold">{heading}</TextMd>
        <Icon as={IconLock} boxSize={5} />
      </CardHeader>
      <CardBody
        as={HStack}
        spacing={2}
        alignItems="center"
        color="green.400"
        p={0}
      >
        <Icon as={IconDiscountCheckFilled} boxSize={5} />
        <TextMd fontWeight="semibold">Your seat is secured.</TextMd>
      </CardBody>
    </Card>
  )
}
